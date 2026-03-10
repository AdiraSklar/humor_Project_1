import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HeaderNav from '@/app/protected/HeaderNav';
import UploadClient from '@/components/UploadClient';

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-gradient-to-br from-purple-600 to-blue-500 text-white min-h-screen">
      <HeaderNav user={user} />
      <div className="w-full max-w-lg px-4 py-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center">Upload & Generate Captions</h1>
        <UploadClient />
      </div>
    </div>
  );
}