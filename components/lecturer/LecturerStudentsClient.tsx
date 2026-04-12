'use client'

import { useState, useEffect } from 'react'
import { Users, Mail, Hash, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { CardLoader } from '@/components/ui/LoadingSpinner'

interface Student {
  id: number
  name: string
  email: string
  uni_id?: number | null
  created_at?: string
}

export default function LecturerStudentsClient() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/lecturer/students')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error((data && typeof data.message === 'string') ? data.message : res.statusText || 'Failed to load students')
        }
        return data
      })
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load students'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.uni_id != null && String(s.uni_id).includes(searchQuery))
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-800 px-8 py-8 shadow-lg mb-8 mt-4"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-24 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Users size={36} /> Students
            </h1>
            <p className="text-white/90 text-lg">View students enrolled in your courses</p>
          </div>
          <div className="hidden lg:flex items-center gap-6 bg-white/10 backdrop-blur-md rounded-xl px-6 py-4">
            <p className="text-white/70 text-sm">Total</p>
            <p className="text-3xl font-bold text-white">{students.length}</p>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="relative">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <CardLoader variant="users" text="Loading students..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No students match your search.' : 'No students found.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 font-medium text-gray-700">Student ID</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" /> {s.email}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.uni_id != null ? (
                        <span className="flex items-center gap-2">
                          <Hash size={14} className="text-gray-400" /> {s.uni_id}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
