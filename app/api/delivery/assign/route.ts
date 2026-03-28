import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import * as crypto from 'crypto'

/** Send SMS via Dialog Rich Communication API and return response */
async function sendSmsToRider(phone: string, message: string) {
  try {
    let cleanPhone = String(phone).replace(/[^\d+]/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '94' + cleanPhone.slice(1)
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.slice(1)
    }
    
    if (cleanPhone.length < 9) return { error: 'Invalid phone number length' }

    const username = process.env.DIALOG_SMS_USER || 'Upview'
    const password = process.env.DIALOG_SMS_PASSWORD || 'Upv!3w@321'
    const mask = process.env.DIALOG_SMS_MASK || 'BMF'
    const digest = crypto.createHash('md5').update(password).digest('hex')

    // Get time in Asia/Colombo YYYY-MM-DDTHH:mm:ss
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Colombo',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    })
    const now = formatter.format(new Date()).replace(' ', 'T')

    const res = await fetch('https://richcommunication.dialog.lk/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        USER: username,
        DIGEST: digest,
        CREATED: now,
      },
      body: JSON.stringify({
        messages: [{
          clientRef: 'RPOSbyUpview',
          number: cleanPhone,
          mask,
          text: message,
          campaignName: 'restsaaspos',
        }],
      }),
    })
    
    const data = await res.json().catch(() => null)
    console.log('[SMS] Dialog API Response:', data)
    return data
  } catch (e: any) {
    console.warn('[SMS] Failed to send:', e)
    return { error: e.message }
  }
}

/**
 * POST /api/delivery/assign — Assign an order to a delivery rider.
 * Body: { order_id: string, order_type: 'food' | 'laundry', rider_id: number }
 * Creates a row in the `deliveries` table, updates source order, and sends SMS to rider.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { order_id, order_type, rider_id } = body

    if (!order_id) return NextResponse.json({ message: 'order_id is required' }, { status: 400 })
    if (!order_type || !['food', 'laundry'].includes(order_type)) {
      return NextResponse.json({ message: 'order_type must be "food" or "laundry"' }, { status: 400 })
    }
    if (!rider_id) return NextResponse.json({ message: 'rider_id is required' }, { status: 400 })

    const client = await createClient()

    // Verify rider exists and has delivery role
    const { data: rider } = await client
      .from('users')
      .select('id, name, email')
      .eq('id', rider_id)
      .eq('role', 'delivery')
      .single()

    if (!rider) return NextResponse.json({ message: 'Rider not found or not a delivery user' }, { status: 404 })

    // Auto-sync: Ensure rider has a delivery_agents row to satisfy foreign key constraint
    const { data: agentProfile } = await client
      .from('delivery_agents')
      .select('id')
      .eq('id', rider_id)
      .maybeSingle()

    if (!agentProfile) {
      const { error: syncError } = await client.from('delivery_agents').insert({
        id: rider.id,
        name: rider.name,
        phone: null,
        is_available: true
      })
      if (syncError) {
        console.error('Auto-sync delivery_agents error:', syncError)
        return NextResponse.json({ message: 'Database sync error: ' + syncError.message }, { status: 500 })
      }
    }

    // Check if already assigned
    const { data: existing } = await client
      .from('deliveries')
      .select('id')
      .eq('order_id', order_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ message: 'This order is already assigned to a rider' }, { status: 409 })
    }

    // Create delivery assignment
    const { data: delivery, error: deliveryError } = await client
      .from('deliveries')
      .insert({
        order_id,
        delivery_agent_id: rider_id,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (deliveryError) {
      console.error('Failed to create delivery:', deliveryError)
      return NextResponse.json({ message: deliveryError.message }, { status: 400 })
    }

    // Update the source order status
    const table = order_type === 'food' ? 'food_orders' : 'laundry_orders'
    const orderQuery = await client.from(table).select('*').eq('id', order_id).single()
    const orderData = orderQuery.data
    await client.from(table).update({ status: 'assigned' }).eq('id', order_id)

    // Build SMS message with order details
    const orderRef = orderData?.order_ref || `${order_type.toUpperCase()}-${order_id}`
    const customerName = orderData?.customer_name || 'Customer'
    const address = orderData?.delivery_address || orderData?.pickup_address || 'N/A'
    const total = orderData?.total ?? 0

    // Get rider phone from delivery_agents
    const { data: profile } = await client
      .from('delivery_agents')
      .select('phone')
      .eq('id', rider_id)
      .single()

    const riderPhone = profile?.phone || ''
    const customerPhone = orderData?.customer_phone || ''

    const smsMessage = `🚴 UniLife Delivery!\nNew order assigned to you.\n📦 Order: ${orderRef}\n👤 Customer: ${customerName}\n📍 Address: ${address}\n💰 Total: RS ${Number(total).toLocaleString()}\n${order_type === 'food' ? '🍕 Food Order' : '🧺 Laundry Order'}`

    let smsSent = false
    let smsResponse: any = null

    // Send SMS to Rider
    if (riderPhone) {
      smsResponse = await sendSmsToRider(riderPhone, smsMessage)
      smsSent = smsResponse?.resultDesc === 'SUCCESS'
    }

    // Optionally send SMS to customer about assignment
    if (customerPhone) {
      sendSmsToRider(customerPhone, `✅ Your ${order_type} order (${orderRef}) has been assigned to rider ${rider.name}. Delivery on the way!`)
    }

    return NextResponse.json({
      message: `Order assigned to ${rider.name}`,
      delivery,
      sms_sent: smsSent,
      sms_response: smsResponse
    })
  } catch (e) {
    console.error('Delivery assign POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/delivery/assign — Update delivery status.
 * Body: { delivery_id: string, status: 'picked_up' | 'delivered', order_id?: string, order_type?: 'food' | 'laundry' }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyRole('delivery')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { delivery_id, status, order_id, order_type } = body

    if (!delivery_id) return NextResponse.json({ message: 'delivery_id is required' }, { status: 400 })

    const validStatuses = ['assigned', 'picked_up', 'delivered']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ message: `status must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const client = await createClient()

    const { data, error } = await client
      .from('deliveries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', delivery_id)
      .select()
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    // Also update the source order status when delivered
    if (status === 'delivered' && order_id && order_type) {
      const table = order_type === 'food' ? 'food_orders' : 'laundry_orders'
      const orderStatus = order_type === 'food' ? 'completed' : 'completed'
      
      // Get the order details for the SMS
      const { data: orderData } = await client.from(table).select('*').eq('id', order_id).single()
      
      await client.from(table).update({ status: orderStatus }).eq('id', order_id)

      if (orderData && orderData.customer_phone) {
        const orderRef = orderData.order_ref || `${order_type.toUpperCase()}-${order_id}`
        const smsMsg = `✅ UniLife: Your ${order_type} order (${orderRef}) has been successfully delivered! Enjoy!`
        // Fire and forget
        sendSmsToRider(orderData.customer_phone, smsMsg).catch(e => console.error('Delivery SMS failed', e))
      }
    }

    return NextResponse.json({ message: `Delivery status updated to ${status}`, delivery: data })
  } catch (e) {
    console.error('Delivery assign PATCH error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
