import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'
import { isDeliveryServiceAvailable } from '@/lib/delivery-availability.server'

function isValidSriLankaPhone(value: unknown): boolean {
  const digits = String(value ?? '').replace(/[^\d]/g, '')
  return /^0(7\d{8}|1\d{8}|2\d{8})$/.test(digits) || /^94(7\d{8}|1\d{8}|2\d{8})$/.test(digits)
}

function buildOrderRef() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const t = String(now.getTime()).slice(-6)
  return `LND-${y}${m}${d}-${t}`
}

function extractPaymentFromNotes(notes: string | null | undefined) {
  const text = String(notes ?? '')
  // Example: "Payment: Cash on Delivery" or "Payment: Visa/Mastercard"
  const m = text.match(/Payment:\s*([^|\n\r]+)/i)
  return m?.[1]?.trim() || '—'
}

/** POST /api/student/laundry-orders — create laundry order as student */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const {
      laundry_shop_id,
      customer_name,
      customer_phone,
      items_description,
      total,
      pickup_address,
      delivery_address,
      notes,
    } = body

    const studentTag = `StudentUserId: ${user.id}`

    if (!laundry_shop_id) return NextResponse.json({ message: 'laundry_shop_id is required' }, { status: 400 })
    if (!customer_name || !String(customer_name).trim()) return NextResponse.json({ message: 'Customer name is required' }, { status: 400 })
    if (!isValidSriLankaPhone(customer_phone)) return NextResponse.json({ message: 'Invalid Sri Lankan phone number' }, { status: 400 })
    if (!items_description || !String(items_description).trim()) return NextResponse.json({ message: 'items_description is required' }, { status: 400 })
    if (!pickup_address || !String(pickup_address).trim()) return NextResponse.json({ message: 'pickup_address is required' }, { status: 400 })
    if (!delivery_address || !String(delivery_address).trim()) return NextResponse.json({ message: 'delivery_address is required' }, { status: 400 })

    const parsedTotal = parseFloat(String(total ?? 0))
    if (!Number.isFinite(parsedTotal) || parsedTotal < 0) {
      return NextResponse.json({ message: 'Invalid total amount' }, { status: 400 })
    }

    const client = await createClient()
    const { data: shop } = await client.from('laundry_shops').select('id').eq('id', laundry_shop_id).single()
    if (!shop) return NextResponse.json({ message: 'Laundry shop not found' }, { status: 404 })

    const deliveryAvailable = await isDeliveryServiceAvailable(client)
    if (!deliveryAvailable) {
      return NextResponse.json({ message: 'Delivery not available' }, { status: 409 })
    }

    const { data, error } = await client
      .from('laundry_orders')
      .insert({
        laundry_shop_id,
        order_ref: buildOrderRef(),
        customer_name: String(customer_name).trim(),
        customer_phone: String(customer_phone).trim(),
        items_description: String(items_description).trim(),
        total: parsedTotal,
        status: 'pending',
        pickup_address: String(pickup_address).trim(),
        delivery_address: String(delivery_address).trim(),
        notes: (() => {
          const base = notes ? String(notes).trim() : ''
          if (!base) return studentTag
          if (base.includes(studentTag)) return base
          return `${base}\n${studentTag}`
        })(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('Student laundry-orders POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** GET /api/student/laundry-orders — list current student's laundry orders */
export async function GET() {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const studentTag = `StudentUserId: ${user.id}`

    let { data, error } = await client
      .from('laundry_orders')
      .select('*')
      .ilike('notes', `%${studentTag}%`)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    // Backward compatibility: older orders without StudentUserId tag
    if (!data || (data.length === 0 && user.name)) {
      const fallback = await client
        .from('laundry_orders')
        .select('*')
        .eq('customer_name', user.name)
        .order('created_at', { ascending: false })
        .limit(20)
      data = fallback.data ?? []
    }

    const orders = (data ?? []).map((o: any) => {
      const amount = Number(o.total ?? o.total_amount ?? 0) || 0
      return {
        ...o,
        total_final: amount,
        items_description_final: (o.items_description && String(o.items_description).trim()) || (o.service && String(o.service).trim()) || 'Laundry service',
        pickup_address: o.pickup_address ?? o.address ?? null,
        delivery_address: o.delivery_address ?? o.address ?? null,
        payment_method: extractPaymentFromNotes(o.notes),
      }
    })

    return NextResponse.json({ orders })
  } catch (e) {
    console.error('Student laundry-orders GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

