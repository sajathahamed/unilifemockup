'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Building2, Shield, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/auth'
import { Button, Input, Select, Alert } from '@/components'

interface CreateUserFormProps {
    currentUserRole: UserRole
    onSuccess?: () => void
}

export default function CreateUserForm({ currentUserRole, onSuccess }: CreateUserFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: '',
        university: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [generalError, setGeneralError] = useState<string | null>(null)
    const [generalSuccess, setGeneralSuccess] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Filter role options based on current user role
    const roleOptions = [
        { value: 'student', label: 'Student' },
        { value: 'lecturer', label: 'Lecturer' },
        { value: 'vendor-food', label: 'Food Vendor' },
        { value: 'vendor-laundry', label: 'Laundry Vendor' },
        { value: 'delivery', label: 'Delivery Rider' },
        { value: 'admin', label: 'Admin' },
        { value: 'super_admin', label: 'Super Admin' },
    ]

    // Sample universities (can be fetched from database)
    const universityOptions = [
        { value: '', label: 'Select university (optional)' },
        { value: '1', label: 'University of Lagos' },
        { value: '2', label: 'University of Ibadan' },
        { value: '3', label: 'Ahmadu Bello University' },
        { value: '4', label: 'University of Nigeria, Nsukka' },
    ]

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'
        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 8) newErrors.password = 'Min. 8 characters'
        if (!formData.role) newErrors.role = 'Role is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setGeneralError(null)
        setGeneralSuccess(null)

        if (!validateForm()) return

        setIsLoading(true)

        const useApi = currentUserRole === 'super_admin' || currentUserRole === 'admin'
        const apiUrl = currentUserRole === 'super_admin' ? '/api/super-admin/users' : '/api/admin/users'

        try {
            if (useApi) {
                // Create user via API (service role) so current user's session is not replaced
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.fullName,
                        email: formData.email,
                        password: formData.password,
                        role: formData.role,
                        uni_id: formData.university || null,
                    }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`)
                setGeneralSuccess(`Account created successfully for ${formData.fullName}!`)
                setFormData({ fullName: '', email: '', password: '', role: '', university: '' })
                if (onSuccess) onSuccess()
                router.refresh()
                return
            }

            const supabase = createClient()
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { name: formData.fullName, role: formData.role },
                },
            })
            if (authError) throw authError
            if (!authData.user) throw new Error('Failed to create account')

            const { error: profileError } = await supabase.from('users').insert({
                auth_id: authData.user.id,
                email: formData.email,
                name: formData.fullName,
                role: formData.role,
                uni_id: formData.university ? parseInt(formData.university) : null,
            })
            if (profileError) throw profileError

            setGeneralSuccess(`Account created successfully for ${formData.fullName}!`)
            setFormData({ fullName: '', email: '', password: '', role: '', university: '' })
            if (onSuccess) onSuccess()
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Shield size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Create New Account</h2>
                    <p className="text-sm text-gray-500">Add a new user to the platform with specific roles.</p>
                </div>
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

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        icon={User}
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        error={errors.fullName}
                        disabled={isLoading}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        error={errors.email}
                        disabled={isLoading}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Temporary Password"
                        type="password"
                        placeholder="Min. 8 characters"
                        icon={Lock}
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        error={errors.password}
                        disabled={isLoading}
                    />

                    <Select
                        label="Account Role"
                        options={roleOptions}
                        placeholder="Select a role"
                        value={formData.role}
                        onChange={(e) => updateField('role', e.target.value)}
                        error={errors.role}
                        disabled={isLoading}
                    />
                </div>

                <Select
                    label="University Assignment"
                    icon={Building2}
                    options={universityOptions}
                    value={formData.university}
                    onChange={(e) => updateField('university', e.target.value)}
                    helperText="Optional - links the user to a specific campus"
                    disabled={isLoading}
                />

                <div className="pt-4 flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        isLoading={isLoading}
                        className="min-w-[200px]"
                    >
                        Create Account
                    </Button>
                </div>
            </form>
        </div>
    )
}
