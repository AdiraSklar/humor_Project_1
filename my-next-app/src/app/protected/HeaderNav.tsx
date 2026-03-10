'use client'

import { type User } from '@supabase/supabase-js';
import Link from 'next/link';
import UserProfile from './UserProfile';
import { usePathname } from 'next/navigation';

function navCls(active: boolean) {
  return `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
    active
      ? 'bg-violet-500/15 text-violet-200 border border-violet-400/30'
      : 'text-white/45 hover:text-violet-300 hover:bg-violet-500/10'
  }`;
}

export default function HeaderNav({ user }: { user: User }) {
  const pathname = usePathname();

  const majorsActive   = pathname === '/protected';
  const captionsActive = pathname === '/protected/captions';
  const uploadActive   = pathname === '/upload';

  return (
    <div
      className="w-full sticky top-0 z-20 border-b border-white/[0.06] backdrop-blur-2xl"
      style={{ background: 'rgba(8,8,14,0.82)' }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 px-4 h-14">

        {/* Nav pills */}
        <div className="flex items-center gap-1">
          <Link href="/protected">
            <button type="button" className={navCls(majorsActive)}>Majors</button>
          </Link>
          <Link href="/protected/captions">
            <button type="button" className={navCls(captionsActive)}>Rate Captions</button>
          </Link>
          <Link href="/upload">
            <button type="button" className={navCls(uploadActive)}>Generate</button>
          </Link>
        </div>

        {/* Avatar */}
        <UserProfile user={user} />
      </div>
    </div>
  );
}