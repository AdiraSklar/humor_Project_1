import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HeaderNav from '@/app/protected/HeaderNav';
import UploadClient from '@/components/UploadClient';

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  return (
    <div className="flex-1 w-full flex flex-col items-center min-h-screen text-white" style={{ background: 'radial-gradient(ellipse 110% 40% at 50% 0%, rgba(124,58,237,0.14) 0%, #08080e 58%)' }}>
      <HeaderNav user={user} />
      <div className="w-full max-w-lg px-4 flex flex-col gap-8 pb-10">

        {/* Page hero */}
        <div className="flex flex-col items-center gap-2 text-center pt-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-400/60">Generate</span>
          <h1
            className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Create Captions
          </h1>
          <p className="text-sm text-white/35 max-w-xs leading-relaxed">
            Upload a meme and we&apos;ll generate funny captions for it
          </p>
        </div>

        <UploadClient />
      </div>
    </div>
  );
}