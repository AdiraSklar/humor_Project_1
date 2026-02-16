'use client'

import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function AuthButtons({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const GoogleIcon = () => (
    <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691c-1.341 2.651-2.091 5.62-2.091 8.659s.75 6.008 2.091 8.659l-5.657 5.657C.603 33.155 0 28.7 0 24s.603-9.155 2.65-13.657l3.656 3.656z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.2-5.2l-5.657-5.657c-1.745 1.162-3.956 1.857-6.543 1.857c-5.223 0-9.654-3.343-11.303-8H6.306c1.649 4.657 6.08 8 11.303 8c1.341 0 2.65-.138 3.917-.389l-5.657 5.657C29.268 43.397 24.636 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );

  return user ? (
    <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
      Sign Out
    </button>
  ) : (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
    >
      <GoogleIcon />
      Sign in with Google
    </button>
  )
}
