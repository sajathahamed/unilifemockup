import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const url = new URL(request.url)
  const target = new URL('/api/laundry', url.origin)
  target.searchParams.set('id', id)

  const res = await fetch(target, {
    method: 'GET',
    headers: request.headers,
    cache: 'no-store',
  })

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '')
    return NextResponse.json(
      { message: 'Upstream did not return JSON', status: res.status, preview: text.slice(0, 200) },
      { status: 502 }
    )
  }

  const data = await res.json().catch(() => null)
  // Normalize: /api/laundry?id=... returns { result } whereas the old route expected the vendor object.
  if (data && typeof data === 'object' && 'result' in (data as any)) {
    return NextResponse.json((data as any).result ?? null, { status: res.status })
  }
  return NextResponse.json(data, { status: res.status })
}

