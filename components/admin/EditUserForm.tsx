'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, User, Building2, Shield, Loader2, ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/auth'
import { Button, Input, Select, Alert } from '@/components'
import { useRouter } from 'next/navigation'

interface UserData {
    id: number
    name: string
    email: string
    role: string
    uni_id: number | null
}

interface EditUserFormProps {
    userId: string
    currentUserRole: UserRole
    onSuccess?: () => void
}

export default function EditUserForm({ userId, currentUserRole, onSuccess }: EditUserFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '',
        university: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [generalError, setGeneralError] = useState<string | null>(null)
    const [generalSuccess, setGeneralSuccess] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [universities, setUniversities] = useState<{ id: number; name: string }[]>([])
    const [isLoadingUniversities, setIsLoadingUniversities] = useState(true)

    // Fetch universities and user data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createClient()
                
                // Fetch universities
                const { data: uniData } = await supabase
                    .from('universities')
                    .select('id, name')
                    .eq('is_active', true)
                    .order('name', { ascending: true })
                
                setUniversities(uniData || [])
                setIsLoadingUniversities(false)

                // Fetch user data
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single()

                if (error) throw error
                if (data) {
                    setFormData({
                        fullName: data.name || '',
                        email: data.email || '',
                        role: data.role || '',
                        university: data.uni_id?.toString() || '',
                    })
                }
            } catch (err) {
                setGeneralError(err instanceof Error ? err.message : 'Failed to fetch data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [userId])

    // Filter role options based on current user role
    const roleOptions = [
        { value: 'student', label: 'Student' },
        { value: 'lecturer', label: 'Lecturer' },
        { value: 'vendor', label: 'Vendor Admin' },
        { value: 'delivery', label: 'Delivery Rider' },
        { value: 'admin', label: 'Admin' },
        { value: 'super_admin', label: 'Super Admin' },
    ]

    // Build university options from fetched data
    const universityOptions = [
        { value: '', label: 'Select university (optional)' },
        ...universities.map(uni => ({ value: uni.id.toString(), label: uni.name }))
    ]

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'
        if (!formData.role) newErrors.role = 'Role is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setGeneralError(null)
        setGeneralSuccess(null)

        if (!validateForm()) return

        setIsSaving(true)

        try {
            const supabase = createClient()

            // Update users table
            const { error: profileError } = await supabase
                .from('users')
                .update({
                    email: formData.email,
                    name: formData.fullName,
                    role: formData.role,
                    uni_id: formData.university ? parseInt(formData.university) : null,
                })
                .eq('id', userId)

            if (profileError) throw profileError

            setGeneralSuccess(`User account updated successfully!`)

            if (onSuccess) {
                setTimeout(onSuccess, 1500)
            }

        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setIsSaving(false)
        }
    }

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-500">
                <Loader2 size={32} className="animate-spin mb-4 text-primary" />
                <p>Loading user details...</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Edit User Profile</h2>
                        <p className="text-sm text-gray-500">Update account details and role assignments.</p>
                    </div>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {generalError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        <Alert type="error" message={generalError} onClose={() => setGeneralError(null)} />
                    </motion.div>
                )}
                {generalSuccess && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        <Alert type="success" message={generalSuccess} onClose={() => setGeneralSuccess(null)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        icon={User}
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        error={errors.fullName}
                        disabled={isSaving}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        error={errors.email}
                        disabled={isSaving}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="Account Role"
                        options={roleOptions}
                        placeholder="Select a role"
                        value={formData.role}
                        onChange={(e) => updateField('role', e.target.value)}
                        error={errors.role}
                        disabled={isSaving}
                    />

                    <Select
                        label="University Assignment"
                        icon={Building2}
                        options={universityOptions}
                        value={formData.university}
                        onChange={(e) => updateField('university', e.target.value)}
                        helperText="Optional - links the user to a specific campus"
                        disabled={isSaving || isLoadingUniversities}
                    />
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.back()}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="lg"
                        isLoading={isSaving}
                        className="min-w-[160px]"
                    >
                        <Save size={18} className="mr-2" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    )
}
