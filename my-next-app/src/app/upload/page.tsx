import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HeaderNav from '@/app/protected/HeaderNav';
import UploadClient from '@/components/UploadClient';

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  return (
    <div className="flex-1 w-full flex flex-col items-center min-h-screen text-white" style={{ background: 'radial-gradient(ellipse 120% 45% at 50% 0%, rgba(99,102,241,0.1) 0%, #08080e 55%)' }}>
      <HeaderNav user={user} />
      <div className="w-full max-w-lg px-4 py-8 flex flex-col gap-6">

        <UploadClient />
      </div>
    </div>
  );
}