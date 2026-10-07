import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { registerSchema } from '../schemas'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { z } from 'zod'
import { ShoppingBag, Store, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react'

type RegisterFormValues = z.infer<typeof registerSchema>

const ROLES = [
  {
    id: 'CUSTOMER' as const,
    label: 'Customer',
    icon: ShoppingBag,
    desc: 'Order fresh treats',
  },
  {
    id: 'SHOPKEEPER' as const,
    label: 'Shopkeeper',
    icon: Store,
    desc: 'Manage store orders',
  },
  {
    id: 'ADMIN' as const,
    label: 'Admin',
    icon: ShieldCheck,
    desc: 'Central control',
  },
]

export const RegisterPage: React.FC = () => {
  const { register: signup, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await signup({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        role: data.role,
      })
      // Successful registration redirect, carrying email state to OTP verification screen
      navigate('/verify-email', { state: { email: data.email } })
    } catch {
      // Errors handled by AuthContext toasts
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-amber-50/20 min-h-[calc(100vh-140px)]">
      <Card className="w-full max-w-lg border border-amber-200/80 shadow-2xl shadow-amber-900/10 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 h-2 w-full" />

        <CardHeader className="text-center space-y-2 pb-2 pt-6 px-6 sm:px-8 border-b border-amber-100/60">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100/80 flex items-center justify-center text-amber-700 mb-1 ring-4 ring-amber-50">
            <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-serif text-stone-900 tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-stone-500 font-sans text-sm">
            Join Payal's Bakery Cottage for artisanal delights
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Mandatory Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Register As <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {ROLES.map((r) => {
                  const Icon = r.icon
                  const isSelected = selectedRole === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setValue('role', r.id, { shouldValidate: true })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer focus-ring ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/80 text-amber-900 shadow-sm ring-1 ring-amber-500/40 font-semibold'
                          : 'border-stone-200 hover:border-amber-300 hover:bg-amber-50/30 text-stone-600'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-amber-700' : 'text-stone-400'}`} />
                      <span className="text-xs font-medium">{r.label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.role.message}</p>
              )}

              {selectedRole === 'ADMIN' && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Security Notice:</strong> Administrator accounts cannot be registered publicly and require backend administrative provisioning.
                  </span>
                </div>
              )}
            </div>

            <FormField label="Full Name" error={errors.fullName?.message} required>
              <Input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                disabled={isLoading}
                {...register('fullName')}
              />
            </FormField>

            <FormField label="Email Address" error={errors.email?.message} required>
              <Input
                type="email"
                placeholder="john@example.com"
                autoComplete="email"
                disabled={isLoading}
                {...register('email')}
              />
            </FormField>

            <FormField
              label="Phone Number"
              error={errors.phoneNumber?.message}
              hint="10-digit Indian mobile number"
              required
            >
              <Input
                type="tel"
                placeholder="9876543210"
                autoComplete="tel"
                maxLength={10}
                disabled={isLoading}
                {...register('phoneNumber')}
              />
            </FormField>

            <FormField
              label="Password"
              error={errors.password?.message}
              hint="Min 8 chars with uppercase, lowercase, number & symbol"
              required
            >
              <PasswordInput
                placeholder="Create secure password"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('password')}
              />
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
              <PasswordInput
                placeholder="Re-enter secure password"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('confirmPassword')}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full mt-6 py-2.5 text-base font-semibold shadow-md bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all"
              isLoading={isLoading}
            >
              {isLoading ? 'Registering...' : `Register as ${selectedRole ? selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase() : 'User'}`}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-amber-100/60 py-4 px-6 bg-stone-50/50 text-sm text-stone-600 font-sans">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-amber-700 font-semibold ml-1.5 hover:text-amber-800 hover:underline focus-ring rounded px-1"
          >
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
export default RegisterPage
