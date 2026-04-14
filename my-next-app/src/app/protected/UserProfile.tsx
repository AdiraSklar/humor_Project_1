'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function UserProfile({ user }: { user: User }) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="focus:outline-none ring-2 ring-transparent hover:ring-violet-500/40 rounded-full transition-all"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="User Avatar"
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-sm font-bold">
            {user.email?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/[0.08] bg-[#111118] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
            <div className="p-1.5">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
