'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function UserProfile({ user }: { user: User }) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const userAvatar = user.user_metadata?.avatar_url || (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8.966 8.966 0 0112 15c2.485 0 4.735.994 6.379 2.621M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <div className="relative">
      <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="focus:outline-none">
        {user.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="User Avatar" className="h-10 w-10 rounded-full" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
            {userAvatar}
          </div>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-10 text-black">
          <div className="p-2">
            <p className="font-semibold text-sm">{user.email}</p>
            <div className="border-t border-gray-200 my-2" />
            <button
              onClick={handleSignOut}
              className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
