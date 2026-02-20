import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CaptionsPage from './CaptionsPage';
import { Caption } from '@/types/caption';
import { Image } from '@/types/image';
import HeaderNav from '../HeaderNav';

// Fisher-Yates shuffle algorithm
function shuffle(array: any[]) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


export default async function ProtectedCaptionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/');
  }

  // 1. Fetch a larger pool of captions
  const { data: captionsPool, error: captionsError } = await supabase
    .from('captions')
    .select('id, content, image_id, is_public, created_datetime_utc')
    .eq('is_public', true)
    .order('created_datetime_utc', { ascending: false })
    .limit(300); // Fetch a larger pool to randomize from

  if (captionsError) {
    console.error("Error fetching captions:", captionsError);
    // Return an error state or empty page if captions fail to load
    return <CaptionsPage captions={[]} imagesMap={{}} />;
  }

  // 2. Shuffle the pool and take the first 50
  const shuffledCaptions = shuffle(captionsPool || []);
  const captions = shuffledCaptions.slice(0, 50);


  console.log(`Fetched ${captionsPool?.length || 0} captions, showing 50 randomized.`);

  // 3. Process image IDs from the final 50 captions
  const allImageIds = captions?.map(c => c.image_id).filter(Boolean) || [];
  console.log(`Found ${allImageIds.length} image IDs before deduplication.`);

  const uniqueImageIds = [...new Set(allImageIds)];
  console.log(`Found ${uniqueImageIds.length} unique image IDs after deduplication.`);
  
  let imagesMap: { [key: string]: string } = {};

  // 4. Fetch images in chunks if necessary
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
        continue; // Continue to next chunk even if one fails
      }

      if (imagesChunk) {
        allImages = allImages.concat(imagesChunk);
      }
    }
    
    console.log(`Fetched a total of ${allImages.length} image rows.`);

    // 5. Build the imagesMap and log bad URLs
    if (allImages) {
      imagesMap = allImages.reduce((acc, image) => {
        if (!image.url) {
          console.log(`Image with id ${image.id} has a null or empty url.`);
        } else {
          acc[image.id] = image.url;
        }
        return acc;
      }, {} as { [key: string]: string });
    }
    console.log(`Built imagesMap with ${Object.keys(imagesMap).length} keys.`);
  }

  const visibleCaptions = (captions as Caption[] || []).filter(c => imagesMap[c.image_id]);
  console.log(`Rendering ${visibleCaptions.length}/${captions.length || 0} captions with visible images.`);


  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center bg-gradient-to-br from-purple-600 to-blue-500 text-white min-h-screen">
      <HeaderNav user={user} />
      <CaptionsPage captions={visibleCaptions} imagesMap={imagesMap} />
    </div>
  );
}
