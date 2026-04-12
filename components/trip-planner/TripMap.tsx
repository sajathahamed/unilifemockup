'use client'

import { useEffect, useRef } from 'react'

interface MapPoint {
  lat: number
  lng: number
  title: string
}

interface TripMapProps {
  points: MapPoint[]
  destination: string
}

export default function TripMap({ points, destination }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Load Leaflet from CDN if not already loaded
    if (!(window as any).L) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => initMap()
      document.head.appendChild(script)
    } else {
      initMap()
    }

    function initMap() {
      const L = (window as any).L
      if (!L || !mapRef.current) return

      // Cleanup existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Initialize map
      const map = L.map(mapRef.current).setView([0, 0], 2)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      const validPoints = points.filter(p => p.lat && p.lng)
      
      if (validPoints.length > 0) {
        const coords = validPoints.map(p => [p.lat, p.lng] as [number, number])
        
        // Add markers
        validPoints.forEach((p, i) => {
          const marker = L.marker([p.lat, p.lng]).addTo(map)
          marker.bindPopup(`<b>${i + 1}. ${p.title}</b>`).openPopup()
        })

        // Add Path Line (Polyline)
        if (coords.length > 1) {
          L.polyline(coords, {
            color: '#6366f1', // Indigo-500
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 10',
            lineJoin: 'round'
          }).addTo(map)
        }

        // Fit bounds
        const bounds = L.latLngBounds(coords)
        map.fitBounds(bounds, { padding: [50, 50] })
      } else {
        // Fallback to searching place? Or just stay at center.
        console.warn('No coordinates found for map markers.')
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [points, destination])

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full z-0" 
      style={{ minHeight: '300px' }}
    />
  )
}
