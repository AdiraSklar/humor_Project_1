import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MajorsPage from './MajorsPage'
import { Major } from '@/types/major'
import HeaderNav from './HeaderNav'; // Import the new HeaderNav component

export default async function ProtectedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/')
  }

  // Fetch majors server-side after user is confirmed
  const { data: majors, error: majorsError } = await supabase.from('university_majors').select('*').order('name');

  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center bg-gradient-to-br from-purple-600 to-blue-500 text-white min-h-screen">
      <HeaderNav user={user} /> {/* Use the shared HeaderNav component */}
      <MajorsPage majors={majors as Major[] || []} majorsError={majorsError} />
      <footer className="w-full border-t border-t-white/10 p-8 flex justify-center text-center text-xs mt-auto">
        <p>
          Powered by{' '}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  );
}

