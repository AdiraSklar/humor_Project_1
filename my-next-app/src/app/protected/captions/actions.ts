'use server';

import { createClient } from '@/utils/supabase/server';

type VoteResult =
    | { ok: true; mode: 'insert' | 'update' }
    | { ok: false; message: string };

export async function handleVote(formData: FormData): Promise<VoteResult> {
  const captionId = String(formData.get('captionId') ?? '');
  const voteValueRaw = formData.get('voteValue');
  const voteValue = Number(voteValueRaw);

  if (!captionId || !Number.isFinite(voteValue)) {
    return { ok: false, message: 'Bad input' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return { ok: false, message: 'User is not authenticated' };
  }

  const now = new Date().toISOString();

  // Try insert first
  const { error: insertError } = await supabase.from('caption_votes').insert([
    {
      created_datetime_utc: now,
      modified_datetime_utc: now,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
      vote_value: voteValue,
      profile_id: user.id,
      caption_id: captionId,
    },
  ]);

  if (!insertError) {
    // IMPORTANT: do NOT revalidatePath here (that causes the 300 re-fetch + reshuffle)
    return { ok: true, mode: 'insert' };
  }

  // Duplicate -> update instead
  if (insertError.code === '23505') {
    const { error: updateError } = await supabase
        .from('caption_votes')
        .update({
          vote_value: voteValue,
          modified_datetime_utc: now,
          modified_by_user_id: user.id,
        })
        .eq('profile_id', user.id)
        .eq('caption_id', captionId);

    if (updateError) {
      return { ok: false, message: `Error updating vote: ${updateError.message}` };
    }

    // IMPORTANT: do NOT revalidatePath here
    return { ok: true, mode: 'update' };
  }

  return { ok: false, message: `Error inserting vote: ${insertError.message}` };
}