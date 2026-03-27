import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

function extractMeta(notes: string | null | undefined) {
  const text = String(notes || '')
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const map: Record<string, string> = {}
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const k = line.slice(0, idx).trim().toLowerCase()
    const v = line.slice(idx + 1).trim()
    map[k] = v
  }
  return {
    delivery_type: map['type']?.toLowerCase().includes('pickup') ? 'pickup' : 'delivery',
    payment_method: map['payment'] ?? 'COD',
    student_tag: map['studentuserid'] ?? '',
  }
}

function parseItems(value: unknown): Array<{ name: string; quantity: number; price: number }> {
  if (Array.isArray(value)) return value as Array<{ name: string; quantity: number; price: number }>
  const raw = String(value ?? '').trim()
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** GET /api/student/food-orders — list current student's orders */
export async function GET() {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const client = await createClient()
    const marker = `StudentUserId: ${user.id}`
    const { data, error } = await client
      .from('food_orders')
      .select('*')
      .ilike('notes', `%${marker}%`)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    let rows = data ?? []

    // Backward compatibility for orders created before StudentUserId tagging.
    if (rows.length === 0 && user.name) {
      const { data: fallbackRows } = await client
        .from('food_orders')
        .select('*')
        .eq('customer_name', user.name)
        .order('created_at', { ascending: false })
        .limit(20)
      rows = fallbackRows ?? []
    }

    const orders = rows.map((o: any) => {
      const meta = extractMeta(o.notes)
      const parsedItems = parseItems(o.items)
      return {
        ...o,
        items: parsedItems,
        total_final: Number(o.total ?? o.total_amount ?? 0),
        delivery_address: o.delivery_address ?? o.address ?? null,
        delivery_type: meta.delivery_type,
        payment_method: meta.payment_method,
      }
    })
    return NextResponse.json({ orders })
  } catch (e) {
    console.error('Student food-orders GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/student/food-orders — student places food order */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const {
      food_stall_id,
      customer_name,
      customer_phone,
      items,
      total,
      delivery_type,
      delivery_address,
      map_link,
      payment_method,
      notes,
    } = body ?? {}

    const cleanedCustomer = String(customer_name || user.name || '').trim()
    const cleanedPhone = String(customer_phone || '').trim()
    const cleanedAddress = String(delivery_address || '').trim()
    const cleanedMapLink = String(map_link || '').trim()
    const cleanedPayment = String(payment_method || 'cod').trim().toLowerCase()
    const deliveryType = delivery_type === 'pickup' ? 'pickup' : 'delivery'
    const parsedItems = Array.isArray(items) ? items : []
    const parsedTotal = total != null ? parseFloat(String(total)) : NaN

    if (!food_stall_id) return NextResponse.json({ message: 'food_stall_id is required.' }, { status: 400 })
    if (cleanedCustomer.length < 2) return NextResponse.json({ message: 'Customer name must be at least 2 characters.' }, { status: 400 })
    if (!/^[+0-9][0-9\s-]{6,19}$/.test(cleanedPhone)) return NextResponse.json({ message: 'Enter a valid phone number.' }, { status: 400 })
    if (deliveryType === 'delivery' && cleanedAddress.length < 4) return NextResponse.json({ message: 'Delivery address must be at least 4 characters.' }, { status: 400 })
    if (cleanedMapLink && !/^https?:\/\/\S+$/i.test(cleanedMapLink)) return NextResponse.json({ message: 'Map link must be a valid URL.' }, { status: 400 })
    if (parsedItems.length === 0) return NextResponse.json({ message: 'Add at least one item.' }, { status: 400 })
    if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) return NextResponse.json({ message: 'Order total must be greater than 0.' }, { status: 400 })
    if (!['cod', 'card', 'wallet'].includes(cleanedPayment)) return NextResponse.json({ message: 'Invalid payment method.' }, { status: 400 })

    const hasInvalidItem = parsedItems.some((it) => {
      if (!it || typeof it !== 'object') return true
      const o = it as Record<string, unknown>
      return (
        typeof o.name !== 'string' ||
        !o.name.trim() ||
        typeof o.quantity !== 'number' ||
        o.quantity <= 0 ||
        typeof o.price !== 'number' ||
        o.price < 0
      )
    })
    if (hasInvalidItem) return NextResponse.json({ message: 'Order items are invalid.' }, { status: 400 })

    const client = await createClient()
    const { data: stall } = await client.from('food_stalls').select('id').eq('id', food_stall_id).maybeSingle()
    if (!stall) return NextResponse.json({ message: 'Food stall not found.' }, { status: 404 })

    const typeNote = `Type: ${deliveryType}${cleanedMapLink ? ` | Map: ${cleanedMapLink}` : ''}`
    const paymentNote = `Payment: ${cleanedPayment.toUpperCase()}`
    const userTag = `StudentUserId: ${user.id}`
    const extraNotes = [String(notes || '').trim(), typeNote, paymentNote, userTag].filter(Boolean).join('\n')

    const { data, error } = await client
      .from('food_orders')
      .insert({
        food_stall_id,
        customer_name: cleanedCustomer,
        customer_phone: cleanedPhone,
        items: parsedItems,
        total: parsedTotal,
        status: 'new',
        delivery_address: cleanedAddress || null,
        notes: extraNotes || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, order: data })
  } catch (e) {
    console.error('Student food-orders POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

