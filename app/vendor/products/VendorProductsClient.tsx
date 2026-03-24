'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Package, Plus, Edit2, Trash2, Search, Utensils, X, Loader2 } from 'lucide-react'
import { UserRole } from '@/lib/auth'

interface Product {
  id: string
  name: string
  category: string
  price: number
  inStock: boolean
  description?: string
  food_stall_id?: number
  image_url?: string
}

const CATEGORIES = ['Main', 'Snacks', 'Sides', 'Drinks', 'Desserts']

function dbToProduct(m: { id: number; name: string; food_category?: string; price: number; food_stall_id?: number; description?: string | null; image_url?: string | null }): Product {
  return {
    id: String(m.id),
    name: m.name,
    category: m.food_category || 'Main',
    price: Number(m.price),
    inStock: true,
    description: m.description || '',
    food_stall_id: m.food_stall_id,
    image_url: m.image_url || '',
  }
}

function getApiError(data: unknown, status: number, fallback: string): string {
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (typeof o.message === 'string' && o.message.trim()) return o.message
    if (typeof o.error === 'string' && o.error.trim()) return o.error
  }
  return status >= 500 ? 'Server error, try again.' : fallback
}

interface VendorProductsClientProps {
  user: { id: number; auth_id: string; name: string; email: string; role: UserRole; avatar_url?: string }
}

export default function VendorProductsClient({ user }: VendorProductsClientProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [stalls, setStalls] = useState<{ id: number; shop_name: string }[]>([])
  const [selectedStallId, setSelectedStallId] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState({ name: '', category: 'Main', price: 0, inStock: true, description: '', image_url: '', stall_id: 0 })

  const loadProducts = async (stallId?: number) => {
    const qs = stallId ? `?food_stall_id=${stallId}` : ''
    const r = await fetch(`/api/vendor/menu-items${qs}`)
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      setMessage({ type: 'error', text: getApiError(data, r.status, 'Failed to load products.') })
      return
    }
    const s = data.stalls ?? []
    setStalls(s)
    const effectiveStallId = stallId || selectedStallId || s[0]?.id || 0
    if (effectiveStallId && effectiveStallId !== selectedStallId) {
      setSelectedStallId(effectiveStallId)
    }
    setProducts((data.items ?? []).map(dbToProduct))
    setForm((p) => ({ ...p, stall_id: effectiveStallId || p.stall_id || 0 }))
  }

  useEffect(() => {
    loadProducts().catch(() => setMessage({ type: 'error', text: 'Network error while loading products.' }))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedStallId) return
    loadProducts(selectedStallId).catch(() => setMessage({ type: 'error', text: 'Network error while loading products.' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStallId])

  const categories = [...new Set(products.map((p) => p.category))]
  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter
    return matchSearch && matchCat
  })

  const openAddModal = () => {
    setForm((p) => ({ name: '', category: 'Main', price: 0, inStock: true, description: '', image_url: '', stall_id: selectedStallId || p.stall_id || stalls[0]?.id || 0 }))
    setShowAddModal(true)
  }

  const openEditModal = (p: Product) => {
    setForm((prev) => ({
      name: p.name,
      category: p.category,
      price: p.price,
      inStock: p.inStock,
      description: (p as Product & { description?: string }).description || '',
      image_url: (p as Product & { image_url?: string }).image_url || '',
      stall_id: (p as Product & { food_stall_id?: number }).food_stall_id ?? prev.stall_id ?? stalls[0]?.id ?? 0,
    }))
    setEditingProduct(p)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!form.name.trim()) return
    const stallId = form.stall_id || selectedStallId || stalls[0]?.id
    if (!stallId) return
    setSaving(true)
    try {
      const res = await fetch('/api/vendor/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_stall_id: stallId,
          name: form.name.trim(),
          food_category: form.category,
          price: form.price,
          image_url: form.image_url.trim() || null,
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.id) {
        await loadProducts(stallId)
        setForm({ name: '', category: 'Main', price: 0, inStock: true, description: '', image_url: '', stall_id: stallId })
        setShowAddModal(false)
        setMessage({ type: 'success', text: 'Product created successfully.' })
      } else {
        setMessage({ type: 'error', text: getApiError(data, res.status, 'Failed to create product.') })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while creating product.' })
    } finally {
      setSaving(false)
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!editingProduct || !form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/vendor/menu-items/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          food_category: form.category,
          price: form.price,
          image_url: form.image_url.trim() || null,
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        await loadProducts(selectedStallId || form.stall_id || stalls[0]?.id)
        setEditingProduct(null)
        setForm({ name: '', category: 'Main', price: 0, inStock: true, description: '', image_url: '', stall_id: form.stall_id })
        setMessage({ type: 'success', text: 'Product updated successfully.' })
      } else {
        setMessage({ type: 'error', text: getApiError(data, res.status, 'Failed to update product.') })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while updating product.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    setMessage(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/vendor/menu-items/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        await loadProducts(selectedStallId || form.stall_id || stalls[0]?.id)
        setDeletingId(null)
        setMessage({ type: 'success', text: 'Product deleted successfully.' })
      } else {
        setMessage({ type: 'error', text: getApiError(data, res.status, 'Failed to delete product.') })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while deleting product.' })
    } finally {
      setSaving(false)
    }
  }

  const renderProductForm = ({ onSubmit, onCancel, title, disabled }: { onSubmit: (e: React.FormEvent) => void; onCancel: () => void; title: string; disabled?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g. Jollof Rice"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price (RS)</label>
        <input
          type="number"
          min={0}
          required
          value={form.price || ''}
          onChange={(e) => setForm((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => setForm((p) => ({ ...p, inStock: e.target.checked }))}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">In Stock</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
          rows={2}
          placeholder="Brief description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
        <input
          value={form.image_url}
          onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="https://example.com/product.jpg"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={disabled} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {disabled ? <Loader2 size={18} className="animate-spin" /> : null}{title}
        </button>
      </div>
    </form>
  )

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-primary" /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 mt-1">Manage your menu items and products</p>
          </div>
          <button
            onClick={openAddModal}
            disabled={stalls.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={selectedStallId || ''}
            onChange={(e) => setSelectedStallId(parseInt(e.target.value, 10) || 0)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[220px]"
          >
            {stalls.map((s) => (
              <option key={s.id} value={s.id}>{s.shop_name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Utensils className="w-7 h-7 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.category}</p>
                  <p className="text-lg font-bold text-primary mt-1">RS {p.price.toLocaleString()}</p>
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(p)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setDeletingId(p.id)}
                  className="flex items-center justify-center gap-1 py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products match your filters</p>
            <button onClick={openAddModal} className="mt-4 text-primary font-medium hover:underline">Add your first product</button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Product</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            {stalls.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Stall</label>
                <select value={form.stall_id} onChange={(e) => setForm((p) => ({ ...p, stall_id: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  {stalls.map((s) => <option key={s.id} value={s.id}>{s.shop_name}</option>)}
                </select>
              </div>
            )}
            {renderProductForm({ onSubmit: handleAddProduct, onCancel: () => setShowAddModal(false), title: 'Add Product', disabled: saving })}
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingProduct(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            {renderProductForm({ onSubmit: handleEditProduct, onCancel: () => setEditingProduct(null), title: 'Save Changes', disabled: saving })}
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeletingId(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700">Cancel</button>
              <button onClick={() => handleDeleteProduct(deletingId)} disabled={saving} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
