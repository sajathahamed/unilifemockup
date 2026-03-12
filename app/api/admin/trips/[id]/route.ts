import { NextRequest, NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/admin/trips/[id] — get single trip with itinerary */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()
    const { data: trip, error: tripError } = await client.from('trips').select('*').eq('id', numId).single()
    if (tripError || !trip) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const { data: itinerary } = await client.from('trip_itinerary').select('*').eq('trip_id', numId).order('day_number')
    return NextResponse.json({ ...trip, itinerary: itinerary ?? [] })
  } catch (e) {
    console.error('Admin trips GET [id] error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/admin/trips/[id] — update trip */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const {
      destination,
      organizer_name,
      organizer_email,
      phone,
      whatsapp,
      description,
      trip_type,
      transport_type,
      inclusions,
      address,
      city,
      area,
      lat,
      lng,
      days,
      estimated_budget,
      departure_date,
      return_date,
      max_participants,
      logo_url,
      banner_url,
      gallery_urls,
      status,
      itinerary,
    } = body

    if (!destination?.trim()) return NextResponse.json({ message: 'Destination is required' }, { status: 400 })
    if (!organizer_name?.trim()) return NextResponse.json({ message: 'Organizer name is required' }, { status: 400 })
    if (!organizer_email?.trim()) return NextResponse.json({ message: 'Organizer email is required' }, { status: 400 })

    const client = await createClient()
    const { error } = await client
      .from('trips')
      .update({
        destination: String(destination).trim(),
        organizer_name: String(organizer_name).trim(),
        organizer_email: String(organizer_email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        whatsapp: whatsapp ? String(whatsapp).trim() : null,
        description: description ? String(description).trim() : null,
        trip_type: trip_type ? String(trip_type).trim() : null,
        transport_type: transport_type ? String(transport_type).trim() : null,
        inclusions: inclusions ? String(inclusions).trim() : null,
        address: address ? String(address).trim() : null,
        city: city ? String(city).trim() : null,
        area: area ? String(area).trim() : null,
        lat: lat != null && lat !== '' ? parseFloat(String(lat)) : null,
        lng: lng != null && lng !== '' ? parseFloat(String(lng)) : null,
        days: days != null && days !== '' ? parseInt(String(days), 10) : null,
        estimated_budget: estimated_budget != null && estimated_budget !== '' ? parseFloat(String(estimated_budget)) : null,
        departure_date: departure_date ? String(departure_date).trim() : null,
        return_date: return_date ? String(return_date).trim() : null,
        max_participants: max_participants != null && max_participants !== '' ? parseInt(String(max_participants), 10) : null,
        logo_url: logo_url ? String(logo_url).trim() : null,
        banner_url: banner_url ? String(banner_url).trim() : null,
        gallery_urls: Array.isArray(gallery_urls) ? gallery_urls : null,
        status: status ? String(status).trim() : 'draft',
      })
      .eq('id', numId)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })

    await client.from('trip_itinerary').delete().eq('trip_id', numId)
    const items = Array.isArray(itinerary) ? itinerary : []
    if (items.length > 0) {
      const rows = items
        .filter((i: { activity?: string }) => i.activity?.trim())
        .map((i: { day_number?: number; activity?: string }, idx: number) => ({
          trip_id: numId,
          day_number: i.day_number != null ? parseInt(String(i.day_number), 10) : idx + 1,
          activity: String(i.activity || '').trim(),
        }))
      if (rows.length > 0) {
        await client.from('trip_itinerary').insert(rows)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Admin trips PUT error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/admin/trips/[id] — delete trip (cascades to itinerary) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const numId = parseInt(id, 10)
    if (isNaN(numId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const client = await createClient()
    const { error } = await client.from('trips').delete().eq('id', numId)

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Admin trips DELETE error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
