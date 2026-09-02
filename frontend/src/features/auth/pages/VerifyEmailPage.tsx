import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { verifyEmailSchema } from '../schemas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { z } from 'zod'
import { MailCheck, RefreshCw, ArrowLeft } from 'lucide-react'

type VerifyEmailValues = z.infer<typeof verifyEmailSchema>

export const VerifyEmailPage: React.FC = () => {
  const { verifyEmail, resendOtp, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Get email from navigation state
  const email = (location.state as any)?.email || ''

  const [countdown, setCountdown] = useState<number>(60)
  const [canResend, setCanResend] = useState<boolean>(false)
  const [isResending, setIsResending] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: '',
    },
  })

  // Start countdown timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, canResend])

  const onSubmit = async (data: VerifyEmailValues) => {
    if (!email) return
    try {
      await verifyEmail(email, data.code)
      navigate('/login', { replace: true })
    } catch {
      // Handled by AuthContext toast
    }
  }

  const handleResendOtp = async () => {
    if (!email || !canResend || isResending) return
    setIsResending(true)
    try {
      await resendOtp(email)
      setCountdown(60)
      setCanResend(false)
    } catch {
      // Handled by context
    } finally {
      setIsResending(false)
    }
  }

  // If email state is missing, redirect user to register
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true })
    }
  }, [email, navigate])

  if (!email) return null

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-amber-50/20 min-h-[calc(100vh-140px)]">
      <Card className="w-full max-w-lg border border-amber-200/80 shadow-2xl shadow-amber-900/10 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 h-2 w-full" />

        <CardHeader className="text-center space-y-2 pb-2 pt-6 px-6 sm:px-8 border-b border-amber-100/60">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-1 ring-4 ring-amber-50">
            <MailCheck className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-3xl font-serif text-stone-900 tracking-tight">Verify Your Email</CardTitle>
          <CardDescription className="text-stone-500 font-sans text-sm">
            We sent a 6-digit verification code to <br />
            <strong className="text-stone-800 font-semibold">{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="6-Digit Verification Code (OTP)" error={errors.code?.message} required>
              <Input
                type="text"
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                disabled={isLoading}
                className="text-center text-2xl tracking-[0.5em] font-mono font-semibold"
                {...register('code')}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full mt-6 py-2.5 text-base font-semibold shadow-md bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all"
              isLoading={isLoading}
            >
              {isLoading ? 'Verifying OTP...' : 'Verify OTP & Activate'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 border-t border-amber-100/60 py-4 px-6 bg-stone-50/50 text-sm text-stone-600 font-sans">
          <div className="flex items-center justify-between w-full">
            <span>Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend || isLoading || isResending}
              className="inline-flex items-center gap-1.5 font-semibold text-amber-700 hover:text-amber-800 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors focus-ring rounded px-1.5 py-0.5"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : canResend ? (
                'Resend OTP'
              ) : (
                `Resend in ${countdown}s`
              )}
            </button>
          </div>
          <div className="text-center w-full pt-1">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-stone-500 hover:text-amber-700 transition-colors text-xs font-semibold focus-ring rounded p-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Registration
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
export default VerifyEmailPage

