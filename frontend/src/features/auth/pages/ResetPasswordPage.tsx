import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { resetPasswordSchema } from '../schemas'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { z } from 'zod'
import { Lock, ArrowLeft } from 'lucide-react'

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const ResetPasswordPage: React.FC = () => {
  const { resetPassword, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Get email from navigation state
  const email = (location.state as any)?.email || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!email) return
    try {
      await resetPassword({
        email,
        code: data.code,
        newPassword: data.password,
      })
      navigate('/login', { replace: true })
    } catch {
      // Handled by context
    }
  }

  // If email state is missing, redirect user back to forgot-password
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true })
    }
  }, [email, navigate])

  if (!email) return null

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-amber-50/20 min-h-[calc(100vh-140px)]">
      <Card className="w-full max-w-lg border border-amber-200/80 shadow-2xl shadow-amber-900/10 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 h-2 w-full" />

        <CardHeader className="text-center space-y-2 pb-2 pt-6 px-6 sm:px-8 border-b border-amber-100/60">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-1 ring-4 ring-amber-50">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-3xl font-serif text-stone-900 tracking-tight">Set New Password</CardTitle>
          <CardDescription className="text-stone-500 font-sans text-sm">
            Enter the 6-digit OTP code sent to <strong className="text-stone-800 font-semibold">{email}</strong> and pick your new password
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Reset OTP Code" error={errors.code?.message} required>
              <Input
                type="text"
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                disabled={isLoading}
                className="text-center text-xl tracking-[0.4em] font-mono font-semibold"
                {...register('code')}
              />
            </FormField>

            <FormField
              label="New Password"
              error={errors.password?.message}
              hint="Min 8 chars with uppercase, lowercase, number & symbol"
              required
            >
              <PasswordInput
                placeholder="Create new secure password"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('password')}
              />
            </FormField>

            <FormField label="Confirm New Password" error={errors.confirmPassword?.message} required>
              <PasswordInput
                placeholder="Re-enter new secure password"
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
              {isLoading ? 'Updating Password...' : 'Reset Password & Sign In'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-amber-100/60 py-4 px-6 bg-stone-50/50 text-sm text-stone-600 font-sans">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1 text-stone-500 hover:text-amber-700 transition-colors text-xs font-semibold focus-ring rounded p-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Request New Reset Code
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
export default ResetPasswordPage

