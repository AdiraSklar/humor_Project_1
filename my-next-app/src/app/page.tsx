import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AuthButtons from './protected/AuthButtons'

export default async function Index() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return redirect('/protected/captions')

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse 100% 55% at 50% 0%, rgba(124,58,237,0.18) 0%, #08080e 62%)' }}
    >
      {/* Hero */}
      <div className="mb-10 flex flex-col items-center gap-4 select-none text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/25 text-4xl shadow-[0_0_40px_rgba(124,58,237,0.2)]">
          😂
        </div>
        <div className="flex flex-col gap-1">
          <h1
            className="text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AlmostCrackd
          </h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">Rate the captions. Judge the memes.</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[340px] flex flex-col gap-5 rounded-2xl border border-violet-500/15 bg-white/[0.04] backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(124,58,237,0.1)]">
        <div className="flex flex-col gap-1 text-center">
          <h2
            className="text-lg font-semibold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Get started
          </h2>
          <p className="text-sm text-white/35">Sign in to start rating captions</p>
        </div>
        <AuthButtons user={null} />
      </div>

      <p className="mt-5 text-[11px] text-white/15 tracking-wide">Google sign-in only · no password needed</p>
    </div>
  )
}
