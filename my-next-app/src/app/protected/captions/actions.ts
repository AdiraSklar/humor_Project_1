'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function handleVote(formData: FormData) {
  const captionId = formData.get('captionId') as string;
  const voteValue = Number(formData.get('voteValue'));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('User is not authenticated');
    return;
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from('caption_votes').insert([
    {
      created_datetime_utc: now,
      modified_datetime_utc: now,
      vote_value: voteValue,
      profile_id: user.id,
      caption_id: captionId,
    },
  ]);

  if (error) {
    console.error('Error inserting vote:', error);
  } else {
    revalidatePath('/protected/captions');
  }
}
