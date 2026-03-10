import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const API_BASE = 'https://api.almostcrackd.ai';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { contentType } = await request.json();

  const res = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ contentType }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}