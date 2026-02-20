import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AuthButtons from './protected/AuthButtons'

export default async function Index() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return redirect('/protected/captions')
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white">
      <div className="flex flex-col gap-8 p-12 bg-white/20 rounded-xl shadow-2xl backdrop-blur-lg text-center max-w-lg w-full">
        <h1 className="font-extrabold text-5xl tracking-tight">
          Sign In
        </h1>
        <p className="text-xl text-gray-200">

        </p>
        <AuthButtons user={null} />
      </div>
    </div>
  )
}

