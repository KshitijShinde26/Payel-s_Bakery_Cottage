import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { editProfileSchema, changePasswordSchema } from '../schemas'
import { profileService } from '../services/profileService'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { User, Lock, Camera, LogOut, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { z } from 'zod'

type EditProfileValues = z.infer<typeof editProfileSchema>
type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'avatar'>('info')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit Profile Form Setup
  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    formState: { errors: errorsInfo },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
    },
  })

  // Change Password Form Setup
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const onUpdateInfo = async (data: EditProfileValues) => {
    setIsSubmitting(true)
    try {
      const updatedUser = await profileService.updateProfile(data)
      updateUser(updatedUser)
      toast.success('Profile details updated successfully!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile details.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onChangePassword = async (data: ChangePasswordValues) => {
    setIsSubmitting(true)
    try {
      await profileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed successfully!')
      resetPassword()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password. Double check current password.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simulated avatar image upload (sends to mock api, falls back on upload error)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verify format and size (max 5MB)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file format. Please upload JPG or PNG.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const data = await profileService.uploadAvatar(formData)
      if (user) {
        updateUser({ ...user, avatarUrl: data.avatarUrl })
      }
      toast.success('Profile picture updated successfully!')
    } catch {
      // Simulate frontend fallback update if backend avatar route doesn't exist
      const objectUrl = URL.createObjectURL(file)
      if (user) {
        updateUser({ ...user, avatarUrl: objectUrl })
      }
      toast.success('Avatar updated! (Simulated local preview)')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabClass = (tab: string) =>
    activeTab === tab
      ? 'flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-primary bg-amber-50 border-l-4 border-primary text-left w-full'
      : 'flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-950 text-left w-full transition-all'

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 font-sans">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Profile Info Sidebar (Desktop 4 columns) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <Card className="border border-amber-100/50 shadow-md">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar
                src={user?.avatarUrl}
                alt={user?.fullName}
                fallback={user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                className="h-24 w-24 border-2 border-primary/20 mb-4 shadow-sm"
              />
              <h2 className="text-xl font-bold font-serif text-stone-900">{user?.fullName}</h2>
              <p className="text-sm text-stone-500 mb-4">{user?.email}</p>

              <div className="flex items-center gap-1.5 mb-2">
                {user?.emailVerified ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Email Verified</span>
                  </Badge>
                ) : (
                  <Badge variant="error" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    <span>Email Unverified</span>
                  </Badge>
                )}
                <Badge variant="secondary" className="uppercase text-[10px]">
                  {user?.role}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Tabs */}
          <Card className="border border-amber-100/50 shadow-md">
            <CardContent className="p-3 flex flex-col space-y-1">
              <button onClick={() => setActiveTab('info')} className={tabClass('info')}>
                <User className="h-4.5 w-4.5" />
                <span>Profile Information</span>
              </button>
              <button onClick={() => setActiveTab('password')} className={tabClass('password')}>
                <Lock className="h-4.5 w-4.5" />
                <span>Change Password</span>
              </button>
              <button onClick={() => setActiveTab('avatar')} className={tabClass('avatar')}>
                <Camera className="h-4.5 w-4.5" />
                <span>Profile Picture</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left w-full border-t border-stone-100 mt-2 cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content Container (Desktop 8 columns) */}
        <div className="lg:col-span-8">
          {activeTab === 'info' && (
            <Card className="border border-amber-100/50 shadow-md">
              <CardHeader className="border-b border-stone-100 pb-4 mb-6">
                <CardTitle className="text-2xl text-stone-900">Profile Information</CardTitle>
                <CardDescription>
                  Update your contact details and cottage profile name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitInfo(onUpdateInfo)} className="space-y-4">
                  <FormField label="Full Name" error={errorsInfo.fullName?.message} required>
                    <Input type="text" disabled={isSubmitting} {...registerInfo('fullName')} />
                  </FormField>

                  <FormField
                    label="Phone Number"
                    error={errorsInfo.phoneNumber?.message}
                    hint="Must be exactly 10 digits"
                    required
                  >
                    <Input type="tel" disabled={isSubmitting} {...registerInfo('phoneNumber')} />
                  </FormField>

                  <Button type="submit" className="mt-4" isLoading={isSubmitting}>
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card className="border border-amber-100/50 shadow-md">
              <CardHeader className="border-b border-stone-100 pb-4 mb-6">
                <CardTitle className="text-2xl text-stone-900">Change Password</CardTitle>
                <CardDescription>
                  Update your account password. Choose a strong combination.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
                  <FormField
                    label="Current Password"
                    error={errorsPassword.currentPassword?.message}
                    required
                  >
                    <PasswordInput disabled={isSubmitting} {...registerPassword('currentPassword')} />
                  </FormField>

                  <FormField
                    label="New Password"
                    error={errorsPassword.newPassword?.message}
                    hint="Min 8 characters, with capitals, numbers, and special symbols"
                    required
                  >
                    <PasswordInput disabled={isSubmitting} {...registerPassword('newPassword')} />
                  </FormField>

                  <FormField
                    label="Confirm New Password"
                    error={errorsPassword.confirmNewPassword?.message}
                    required
                  >
                    <PasswordInput disabled={isSubmitting} {...registerPassword('confirmNewPassword')} />
                  </FormField>

                  <Button type="submit" className="mt-4" isLoading={isSubmitting}>
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'avatar' && (
            <Card className="border border-amber-100/50 shadow-md">
              <CardHeader className="border-b border-stone-100 pb-4 mb-6">
                <CardTitle className="text-2xl text-stone-900">Profile Picture</CardTitle>
                <CardDescription>
                  Upload a high-quality JPEG or PNG photo for your profile avatar
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <Avatar
                  src={user?.avatarUrl}
                  alt={user?.fullName}
                  fallback={user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                  className="h-32 w-32 border-2 border-primary/20 shadow-sm"
                />

                {/* Upload File Zone */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-lg p-6 bg-stone-50/50 w-full max-w-sm text-center">
                  <Camera className="h-10 w-10 text-stone-400 mb-2" />
                  <p className="text-sm font-semibold text-stone-700">Upload Image File</p>
                  <p className="text-xs text-stone-400 mt-1 mb-4">PNG, JPG or JPEG up to 5MB</p>

                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative cursor-pointer"
                    disabled={isSubmitting}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    Select File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
export default ProfilePage
