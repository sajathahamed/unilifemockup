'use client'

import { Download } from 'lucide-react'

type EarningRow = {
  id: string
  date: string
  kind: 'Food' | 'Laundry'
  trips: number
  amount: string
  status: 'Settled' | 'Pending'
}

interface EarningsTableProps {
  rows: EarningRow[]
}

export default function EarningsTable({ rows }: EarningsTableProps) {
  const handleExport = () => {
    // Create CSV content
    const headers = ['Ref', 'Date', 'Type', 'Trips', 'Amount', 'Status']
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        [row.id, row.date, row.kind, row.trips, row.amount, row.status].join(',')
      )
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `earnings-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-[1.05rem] font-semibold tracking-[-0.01em] text-gray-900">Recent payouts</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-blue-100 text-left text-gray-600">
              <th className="pb-3 font-semibold">Ref</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Type</th>
              <th className="pb-3 font-semibold">Trips</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition">
                <td className="py-3 font-medium text-gray-900">{row.id}</td>
                <td className="py-3 text-gray-600">{row.date}</td>
                <td className="py-3 text-gray-700">{row.kind}</td>
                <td className="py-3 text-gray-600">{row.trips}</td>
                <td className="py-3 font-medium text-emerald-700">{row.amount}</td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      row.status === 'Settled'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        row.status === 'Settled' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
