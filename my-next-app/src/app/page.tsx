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
      style={{
        background: 'radial-gradient(ellipse 80% 55% at 50% 38%, rgba(99,102,241,0.13) 0%, #08080e 68%)',
      }}
    >
      {/* Hero */}
      <div className="mb-10 flex flex-col items-center gap-3 select-none text-center">
        <span className="text-6xl leading-none drop-shadow-[0_0_24px_rgba(167,139,250,0.4)]">😂</span>
        <h1 className="text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
          AlmostCrackd
        </h1>
        <p className="text-white/40 text-sm tracking-widest uppercase">Rate the captions. Judge the memes.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[340px] flex flex-col gap-6 rounded-2xl border border-white/[0.09] bg-white/[0.05] backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(99,102,241,0.12)]">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>Welcome back 👋</h2>
          <p className="text-sm text-white/35">Sign in to start rating</p>
        </div>

        <AuthButtons user={null} />
      </div>

      <p className="mt-6 text-[11px] text-white/15 tracking-wide">Google sign-in only · no password needed</p>
    </div>
  )
}