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
    <div className="flex-1 w-full flex flex-col items-center min-h-screen text-white" style={{ background: 'radial-gradient(ellipse 110% 40% at 50% 0%, rgba(124,58,237,0.14) 0%, #08080e 58%)' }}>
      <HeaderNav user={user} />
      <MajorsPage majors={majors as Major[] || []} majorsError={majorsError} />
    </div>
  );
}

