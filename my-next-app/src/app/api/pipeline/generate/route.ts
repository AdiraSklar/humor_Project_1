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

  const { cdnUrl } = await request.json();

  if (!cdnUrl) {
    return NextResponse.json({ error: 'Missing cdnUrl in request body' }, { status: 400 });
  }

  // Step 1: register the image from its CDN URL
  const uploadRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    return NextResponse.json({ error: `upload-image-from-url failed: ${text}` }, { status: uploadRes.status });
  }

  const uploadData = await uploadRes.json();
  const imageId = uploadData.imageId ?? uploadData.image_id ?? uploadData.id;

  if (!imageId) {
    return NextResponse.json(
      { error: 'No imageId in upload-image-from-url response', raw: uploadData },
      { status: 500 }
    );
  }

  // Step 2: generate captions for the registered image
  const captionsRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ imageId, numCaptions: 6 }),
  });

  if (!captionsRes.ok) {
    const text = await captionsRes.text();
    return NextResponse.json({ error: `generate-captions failed: ${text}` }, { status: captionsRes.status });
  }

  const captionsData = await captionsRes.json();

  // Normalize captions into string[] regardless of response shape
  const raw: unknown[] = Array.isArray(captionsData.captions)
    ? captionsData.captions
    : Array.isArray(captionsData)
    ? captionsData
    : [];

  const captions: string[] = raw.map((c) =>
    typeof c === 'string'
      ? c
      : (c as Record<string, string>).content ??
        (c as Record<string, string>).text ??
        String(c)
  );

  return NextResponse.json({ captions: captions.slice(0, 6) });
}