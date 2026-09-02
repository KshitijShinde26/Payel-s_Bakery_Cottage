import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { forgotPasswordSchema } from '../schemas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { z } from 'zod'
import { KeyRound, ArrowLeft } from 'lucide-react'

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await forgotPassword(data.email)
      // Navigate to Reset Password page, carrying the email state
      navigate('/reset-password', { state: { email: data.email } })
    } catch {
      // Handled by context
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-amber-50/20 min-h-[calc(100vh-140px)]">
      <Card className="w-full max-w-lg border border-amber-200/80 shadow-2xl shadow-amber-900/10 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 h-2 w-full" />

        <CardHeader className="text-center space-y-2 pb-2 pt-6 px-6 sm:px-8 border-b border-amber-100/60">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-1 ring-4 ring-amber-50">
            <KeyRound className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-3xl font-serif text-stone-900 tracking-tight">Forgot Password?</CardTitle>
          <CardDescription className="text-stone-500 font-sans text-sm">
            Enter your registered email address and we'll send you an OTP to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Registered Email Address" error={errors.email?.message} required>
              <Input
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                disabled={isLoading}
                {...register('email')}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full mt-6 py-2.5 text-base font-semibold shadow-md bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all"
              isLoading={isLoading}
            >
              {isLoading ? 'Sending Reset Code...' : 'Send Password Reset Code'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-amber-100/60 py-4 px-6 bg-stone-50/50 text-sm text-stone-600 font-sans">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-stone-500 hover:text-amber-700 transition-colors text-xs font-semibold focus-ring rounded p-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
          <Link
            to="/register"
            className="text-amber-700 font-semibold hover:text-amber-800 hover:underline text-xs focus-ring rounded p-1"
          >
            Create Account
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
export default ForgotPasswordPage

