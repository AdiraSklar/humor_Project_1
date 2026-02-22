import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CaptionsPage from './CaptionsPage';
import { Caption } from '@/types/caption';
import { Image } from '@/types/image';
import HeaderNav from '../HeaderNav';



// Fisher-Yates shuffle algorithm (returns a NEW array; does not mutate input)
function shuffleCopy<T,>(array: T[]) {
  const copy = [...array];
  let currentIndex = copy.length;

  while (currentIndex > 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [copy[currentIndex], copy[randomIndex]] = [copy[randomIndex], copy[currentIndex]];
  }

  return copy;
}

export default async function ProtectedCaptionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // 1) Fetch a larger pool of captions, EXCLUDING null/empty content
  const { data: captionsPool, error: captionsError } = await supabase
      .from('captions')
      .select('id, content, image_id, is_public, created_datetime_utc')
      .eq('is_public', true)
      .not('content', 'is', null)
      .neq('content', '')
      .order('created_datetime_utc', { ascending: false })
      .limit(300);

  if (captionsError) {
    console.error('Error fetching captions:', captionsError);
    return <CaptionsPage captions={[]} imagesMap={{}} />;
  }

  // 2) Shuffle the pool and take the first 50
  const shuffledCaptions = shuffleCopy(captionsPool ?? []);
  const captions = shuffledCaptions.slice(0, 50);

  console.log(`Fetched ${captionsPool?.length || 0} captions (non-empty), showing 50 randomized.`);

  // 3) Process image IDs from the final 50 captions
  const allImageIds = captions.map((c) => c.image_id).filter(Boolean);
  const uniqueImageIds = [...new Set(allImageIds)];

  let imagesMap: Record<string, string> = {};

  // 4) Fetch images in chunks if necessary
  if (uniqueImageIds.length > 0) {
    const CHUNK_SIZE = 100;
    let allImages: Image[] = [];

    for (let i = 0; i < uniqueImageIds.length; i += CHUNK_SIZE) {
      const chunk = uniqueImageIds.slice(i, i + CHUNK_SIZE);
      const { data: imagesChunk, error: imagesError } = await supabase
          .from('images')
          .select('id, url')
          .in('id', chunk);

      if (imagesError) {
        console.error(`Error fetching images chunk ${i / CHUNK_SIZE}:`, imagesError);
        continue;
      }

      if (imagesChunk) allImages = allImages.concat(imagesChunk);
    }

    imagesMap = allImages.reduce((acc, image) => {
      if (image.url) acc[image.id] = image.url;
      return acc;
    }, {} as Record<string, string>);
  }

  // 5) Only show captions that have a resolvable image URL
  const visibleCaptions = (captions as Caption[]).filter((c) => imagesMap[c.image_id]);

  console.log(`Rendering ${visibleCaptions.length}/${captions.length} captions with visible images.`);

  return (
      <div className="flex-1 w-full flex flex-col gap-10 items-center bg-gradient-to-br from-purple-600 to-blue-500 text-white min-h-screen">
        <HeaderNav user={user} />
        <CaptionsPage captions={visibleCaptions} imagesMap={imagesMap} />
      </div>
  );
}