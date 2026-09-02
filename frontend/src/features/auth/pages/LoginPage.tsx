import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { loginSchema } from '../schemas'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { z } from 'zod'
import { ShoppingBag, Store, ShieldCheck, Sparkles } from 'lucide-react'

type LoginFormValues = z.infer<typeof loginSchema>

const ROLES = [
  {
    id: 'CUSTOMER' as const,
    label: 'Customer',
    icon: ShoppingBag,
    desc: 'Order fresh bakes',
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
    desc: 'Full bakery control',
  },
]

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      role: 'CUSTOMER',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const user = await login(data)
      const fromPath = (location.state as any)?.from?.pathname

      // Check if user came from a role-matching deep link
      if (fromPath && !fromPath.startsWith('/login') && !fromPath.startsWith('/register') && fromPath !== '/') {
        if (user.role === 'ADMIN' && fromPath.startsWith('/admin')) {
          navigate(fromPath, { replace: true })
          return
        }
        if (user.role === 'SHOPKEEPER' && fromPath.startsWith('/shopkeeper')) {
          navigate(fromPath, { replace: true })
          return
        }
        if (user.role === 'CUSTOMER' && !fromPath.startsWith('/admin') && !fromPath.startsWith('/shopkeeper')) {
          navigate(fromPath, { replace: true })
          return
        }
      }

      // Redirection strictly dictated by the backend authenticated user's role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true })
          break
        case 'SHOPKEEPER':
          navigate('/shopkeeper/dashboard', { replace: true })
          break
        case 'CUSTOMER':
          navigate('/customer/dashboard', { replace: true })
          break
        default:
          navigate('/customer/dashboard', { replace: true })
          break
      }
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
          <CardTitle className="text-3xl font-serif text-stone-900 tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-stone-500 font-sans text-sm">
            Sign in to your Payal's Bakery Cottage account
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Login Role <span className="text-red-500">*</span>
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
            </div>

            <FormField label="Email Address" error={errors.email?.message} required>
              <Input
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                disabled={isLoading}
                {...register('email')}
              />
            </FormField>

            <FormField label="Password" error={errors.password?.message} required>
              <PasswordInput
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
                {...register('password')}
              />
            </FormField>

            <div className="flex items-center justify-between pt-1 text-sm">
              <Checkbox
                label="Remember Me"
                id="rememberMe"
                disabled={isLoading}
                {...register('rememberMe')}
              />
              <Link
                to="/forgot-password"
                className="font-medium text-amber-700 hover:text-amber-800 transition-colors focus-ring rounded px-1 py-0.5"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 py-2.5 text-base font-semibold shadow-md bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all"
              isLoading={isLoading}
            >
              {isLoading ? 'Signing In...' : `Sign In as ${selectedRole ? selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase() : 'User'}`}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-amber-100/60 py-4 px-6 bg-stone-50/50 text-sm text-stone-600 font-sans">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-amber-700 font-semibold ml-1.5 hover:text-amber-800 hover:underline focus-ring rounded px-1"
          >
            Create Account
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
export default LoginPage
