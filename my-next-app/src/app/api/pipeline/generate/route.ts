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

  const generateOne = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ imageId }),
    });
    if (!res.ok) throw new Error(`generate-captions failed: ${await res.text()}`);
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : Array.isArray(data.captions) ? data.captions[0] : data;
    return typeof item === 'string'
      ? item
      : (item as Record<string, string>).content ?? (item as Record<string, string>).text ?? String(item);
  };

  // Stream captions as NDJSON — each fires independently so the client sees them appear one by one
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      await Promise.allSettled(
        Array.from({ length: 4 }, () =>
          generateOne()
            .then(caption => {
              controller.enqueue(encoder.encode(JSON.stringify({ caption }) + '\n'));
            })
            .catch(() => {})
        )
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  });
}
