'use client'

import { type User } from '@supabase/supabase-js';
import Link from 'next/link';
import UserProfile from './UserProfile';
import { usePathname } from 'next/navigation'; // Import usePathname

export default function HeaderNav({ user }: { user: User }) {
  const pathname = usePathname(); // Get current pathname

  const majorsActive = pathname === '/protected';
  const captionsActive = pathname === '/protected/captions';

  return (
    <div className="w-full">
      <nav className="w-full flex justify-center border-b border-b-white/10 h-16">
        <div className="w-full max-w-4xl flex justify-end items-center p-3 text-sm">
          <UserProfile user={user} />
        </div>
      </nav>
      <div className="w-full flex justify-center gap-4 py-4">
          <Link href="/protected">
              <button className={`p-3 text-white rounded-full transition-transform ${majorsActive ? 'bg-blue-500/50 hover:bg-blue-500/60' : 'bg-white/10 hover:bg-white/20 hover:scale-110'}`}>See University Majors</button>
          </Link>
          <Link href="/protected/captions">
              <button className={`p-3 text-white rounded-full transition-transform ${captionsActive ? 'bg-blue-500/50 hover:bg-blue-500/60' : 'bg-white/10 hover:bg-white/20 hover:scale-110'}`}>Rate Captions</button>
          </Link>
      </div>
    </div>
  );
}
