import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Cookie } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-amber-50/10">
      <div className="bg-amber-100 p-4 rounded-full text-amber-700 mb-4 animate-bounce">
        <Cookie className="h-12 w-12" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">
        Page Not Found
      </h1>
      <p className="text-stone-600 max-w-md mb-6 font-sans">
        Oops! It seems the recipe page you are looking for has been eaten or doesn't exist. Let's get you back to the oven.
      </p>
      <Link to="/">
        <Button variant="primary">
          Back to Homepage
        </Button>
      </Link>
    </div>
  )
}
export default NotFoundPage
