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
      {/* Mark */}
      <div className="mb-10 flex flex-col items-center gap-2 select-none">
        <span className="text-5xl leading-none">😂</span>
        <p className="text-white/30 text-xs tracking-[0.25em] uppercase mt-1">Caption · Rate · Repeat</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[340px] flex flex-col gap-6 rounded-2xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-xl font-semibold text-white tracking-tight">Welcome</h1>
          <p className="text-sm text-white/35">Sign in to get started</p>
        </div>

        <AuthButtons user={null} />
      </div>

      <p className="mt-6 text-[11px] text-white/15 tracking-wide">No account needed — Google only</p>
    </div>
  )
}