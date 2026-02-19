import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CaptionsPage from './CaptionsPage';
import { Caption } from '@/types/caption';
import { Image } from '@/types/image';

export default async function ProtectedCaptionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/');
  }

  // 1. Fetch captions
  const { data: captions, error: captionsError } = await supabase
    .from('captions')
    .select('id, content, image_id, is_public, created_datetime_utc')
    .eq('is_public', true)
    .order('created_datetime_utc', { ascending: false })
    .limit(50);

  if (captionsError) {
    console.error("Error fetching captions:", captionsError);
    // Return an error state or empty page if captions fail to load
    return <CaptionsPage captions={[]} imagesMap={{}} />;
  }

  console.log(`Fetched ${captions?.length || 0} captions.`);

  // 2. Process image IDs
  const allImageIds = captions?.map(c => c.image_id).filter(Boolean) || [];
  console.log(`Found ${allImageIds.length} image IDs before deduplication.`);

  const uniqueImageIds = [...new Set(allImageIds)];
  console.log(`Found ${uniqueImageIds.length} unique image IDs after deduplication.`);
  
  let imagesMap: { [key: string]: string } = {};

  // 3. Fetch images in chunks if necessary
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

    // 4. Build the imagesMap and log bad URLs
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


  return <CaptionsPage captions={visibleCaptions} imagesMap={imagesMap} />;
}
