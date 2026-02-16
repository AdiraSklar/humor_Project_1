import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AuthButtons from './protected/AuthButtons'

export default async function Index() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return redirect('/protected')
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white">
      <div className="flex flex-col gap-8 p-12 bg-white/20 rounded-xl shadow-2xl backdrop-blur-lg text-center max-w-lg w-full">
        <h1 className="font-extrabold text-5xl tracking-tight">
          University Majors
        </h1>
        <p className="text-xl text-gray-200">
          Discover and explore a world of knowledge. Sign in to get started.
        </p>
        <AuthButtons user={null} />
      </div>
    </div>
  )
}

