'use client'

import { type User } from '@supabase/supabase-js';
import Link from 'next/link';
import UserProfile from './UserProfile';
import { usePathname } from 'next/navigation';
import { useGeneration } from '@/context/GenerationContext';

function navCls(active: boolean) {
  return `px-4 py-1.5 rounded-lg text-sm transition-all duration-150 ${
    active
      ? 'text-white font-semibold bg-white/[0.09]'
      : 'text-white/40 hover:text-white/70 font-medium'
  }`;
}

export default function HeaderNav({ user }: { user: User }) {
  const pathname = usePathname();
  const { isGenerating } = useGeneration();

  const majorsActive   = pathname === '/protected';
  const captionsActive = pathname === '/protected/captions';
  const uploadActive   = pathname === '/upload';

  return (
    <div
      className="w-full sticky top-0 z-20 border-b border-white/[0.04] backdrop-blur-2xl"
      style={{ background: 'rgba(9,6,20,0.82)' }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 px-4 h-14">

        {/* Brand */}
        <Link href="/protected/captions" className="flex items-center gap-2 shrink-0">
          <span className="text-lg leading-none">😂</span>
          <span
            className="hidden sm:block text-sm font-bold text-white/80 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AlmostCrackd
          </span>
        </Link>

        {/* Nav pills */}
        <div className="flex items-center gap-1">
          {isGenerating ? (
            <>
              <button type="button" disabled className={`${navCls(majorsActive)} opacity-25 cursor-not-allowed`}>Majors</button>
              <button type="button" disabled className={`${navCls(captionsActive)} opacity-25 cursor-not-allowed`}>Rate</button>
              <button type="button" className={navCls(uploadActive)}>Generate</button>
            </>
          ) : (
            <>
              <Link href="/protected">
                <button type="button" className={navCls(majorsActive)}>Majors</button>
              </Link>
              <Link href="/protected/captions">
                <button type="button" className={navCls(captionsActive)}>Rate</button>
              </Link>
              <Link href="/upload">
                <button type="button" className={navCls(uploadActive)}>Generate</button>
              </Link>
            </>
          )}
        </div>

        {/* Avatar */}
        <UserProfile user={user} />
      </div>
    </div>
  );
}
