import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/student/cart-items?cart_type=food&shop_ref=db-8 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const cartType = request.nextUrl.searchParams.get('cart_type') || 'food'
    const shopRef = request.nextUrl.searchParams.get('shop_ref')

    const client = await createClient()
    let query = client
      .from('cart_items')
      .select('id, user_id, cart_type, shop_ref, item_ref, qty, unit_price, item_name, item_description, item_emoji, status, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('cart_type', cartType)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })

    if (shopRef) query = query.eq('shop_ref', shopRef)

    const { data, error } = await query
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ items: data ?? [] })
  } catch (e) {
    console.error('Student cart-items GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/student/cart-items — add/update item qty */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const cartType = String(body?.cart_type || 'food')
    const shopRef = String(body?.shop_ref || '').trim()
    const itemRef = String(body?.item_ref || '').trim()
    const itemName = String(body?.item_name || '').trim()
    const itemDescription = String(body?.item_description || '').trim()
    const itemEmoji = String(body?.item_emoji || '🍽️')
    const unitPrice = Number(body?.unit_price ?? 0)
    const qtyDelta = Number(body?.qty_delta ?? 1)

    if (!shopRef || !itemRef || !itemName) {
      return NextResponse.json({ message: 'shop_ref, item_ref, item_name are required.' }, { status: 400 })
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return NextResponse.json({ message: 'unit_price is invalid.' }, { status: 400 })
    }
    if (!Number.isFinite(qtyDelta) || qtyDelta === 0) {
      return NextResponse.json({ message: 'qty_delta is invalid.' }, { status: 400 })
    }

    const client = await createClient()
    const { data: existing } = await client
      .from('cart_items')
      .select('id, qty')
      .eq('user_id', user.id)
      .eq('cart_type', cartType)
      .eq('shop_ref', shopRef)
      .eq('item_ref', itemRef)
      .maybeSingle()

    if (existing?.id) {
      const nextQty = Math.max(0, Number(existing.qty || 0) + qtyDelta)
      if (nextQty <= 0) {
        const { error: delErr } = await client.from('cart_items').delete().eq('id', existing.id)
        if (delErr) return NextResponse.json({ message: delErr.message }, { status: 400 })
        return NextResponse.json({ ok: true, removed: true })
      }
      const { data, error } = await client
        .from('cart_items')
        .update({
          qty: nextQty,
          unit_price: unitPrice,
          item_name: itemName,
          item_description: itemDescription || null,
          item_emoji: itemEmoji || null,
          status: 'active',
        })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, item: data })
    }

    if (qtyDelta < 0) return NextResponse.json({ ok: true, removed: true })

    const { data, error } = await client
      .from('cart_items')
      .insert({
        user_id: user.id,
        cart_type: cartType,
        shop_ref: shopRef,
        item_ref: itemRef,
        qty: Math.max(1, qtyDelta),
        unit_price: unitPrice,
        item_name: itemName,
        item_description: itemDescription || null,
        item_emoji: itemEmoji || null,
        status: 'active',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, item: data })
  } catch (e) {
    console.error('Student cart-items POST error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** PATCH /api/student/cart-items — set qty for one cart row */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const id = String(body?.id || '').trim()
    const qty = Number(body?.qty ?? 0)
    if (!id) return NextResponse.json({ message: 'id is required.' }, { status: 400 })
    if (!Number.isFinite(qty) || qty < 0) return NextResponse.json({ message: 'qty is invalid.' }, { status: 400 })

    const client = await createClient()
    if (qty === 0) {
      const { error } = await client.from('cart_items').delete().eq('id', id).eq('user_id', user.id)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, removed: true })
    }

    const { data, error } = await client
      .from('cart_items')
      .update({ qty, status: 'active' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, item: data })
  } catch (e) {
    console.error('Student cart-items PATCH error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/student/cart-items?id=... OR ?cart_type=food&shop_ref=db-8 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyRole('student')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const id = request.nextUrl.searchParams.get('id')
    const cartType = request.nextUrl.searchParams.get('cart_type')
    const shopRef = request.nextUrl.searchParams.get('shop_ref')

    const client = await createClient()
    let query = client.from('cart_items').delete().eq('user_id', user.id)
    if (id) query = query.eq('id', id)
    else {
      if (cartType) query = query.eq('cart_type', cartType)
      if (shopRef) query = query.eq('shop_ref', shopRef)
      query = query.eq('status', 'active')
    }

    const { error } = await query
    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Student cart-items DELETE error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

