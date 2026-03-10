'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { handleVote } from './actions';
import type { Caption } from '@/types/caption';

type CaptionsPageProps = {
  captions: Caption[];
  imagesMap: Record<string, string>;
};

const cardVariants = {
  enter: { x: -160, opacity: 0, scale: 0.97 },
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({
    zIndex: 0,
    x: dir === 1 ? 160 : -160,
    opacity: 0,
    scale: 0.97,
  }),
};

export default function CaptionsPage({ captions, imagesMap }: CaptionsPageProps) {
  const [deck] = useState<Caption[]>(() => captions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastVoteDirection, setLastVoteDirection] = useState(1);
  const [isVoting, setIsVoting] = useState(false);

  const activeCaption = useMemo(() => deck[currentIndex], [deck, currentIndex]);
  const imageUrl = useMemo(
    () => (activeCaption ? imagesMap[activeCaption.image_id] : null),
    [activeCaption, imagesMap]
  );

  const handleVoteClick = async (voteDirection: number) => {
    if (isVoting || !activeCaption) return;

    setIsVoting(true);
    setLastVoteDirection(voteDirection);

    const fd = new FormData();
    fd.set('captionId', activeCaption.id);
    fd.set('voteValue', String(voteDirection));

    const res = await handleVote(fd);
    if (res.ok) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      console.error(res.message);
    }

    setTimeout(() => setIsVoting(false), 150);
  };

  const handleRestart = () => setCurrentIndex(0);

  if (deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-64">
        <h2 className="text-2xl font-semibold">No captions to rate!</h2>
        <p className="text-white/50 mt-2">Check back later for more content.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center px-4 pb-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-4">

        {/* Counter badge */}
        <div className="flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-full px-4 py-1.5">
          <span className="text-xs font-semibold text-white/80 tracking-widest">
            {currentIndex < deck.length ? currentIndex + 1 : deck.length}
          </span>
          <span className="text-white/25 text-xs">/</span>
          <span className="text-xs text-white/40 tracking-widest">{deck.length}</span>
        </div>

        {/* Card */}
        <div className="relative w-full overflow-hidden">
          <AnimatePresence initial={false} custom={lastVoteDirection} mode="wait">
            {currentIndex < deck.length ? (
              <motion.div
                key={activeCaption?.id ?? currentIndex}
                custom={lastVoteDirection}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 700, damping: 38 },
                  opacity: { duration: 0.05 },
                }}
                className="w-full bg-white/[0.07] border border-white/[0.09] backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Image — edge to edge */}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Caption"
                    className="w-full max-h-80 object-contain bg-black/30"
                  />
                )}

                {/* Caption */}
                <div className="px-6 pt-5 pb-2">
                  <p className="text-center text-base font-medium leading-relaxed text-white">
                    {activeCaption?.content ?? ''}
                  </p>
                </div>

                {/* Divider */}
                <div className="mx-6 my-4 h-px bg-white/[0.07]" />

                {/* Vote buttons */}
                <div className="flex items-center justify-center gap-4 px-6 pb-6">
                  <button
                    onClick={() => handleVoteClick(-1)}
                    disabled={isVoting}
                    type="button"
                    aria-label="Downvote"
                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-red-500/[0.08] hover:bg-red-500/[0.18] border border-red-500/20 hover:border-red-400/50 text-red-400 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-150 disabled:opacity-40"
                  >
                    <ThumbsDown size={22} />
                    <span className="text-xs font-bold tracking-widest uppercase">Nah</span>
                  </button>

                  <button
                    onClick={() => handleVoteClick(1)}
                    disabled={isVoting}
                    type="button"
                    aria-label="Upvote"
                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-emerald-500/[0.08] hover:bg-emerald-500/[0.18] border border-emerald-500/20 hover:border-emerald-400/50 text-emerald-400 hover:text-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-150 disabled:opacity-40"
                  >
                    <ThumbsUp size={22} />
                    <span className="text-xs font-bold tracking-widest uppercase">Funny</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-white/[0.07] border border-white/[0.09] backdrop-blur-2xl rounded-3xl p-14 flex flex-col items-center gap-6 text-center"
              >
                <span className="text-5xl select-none">🎉</span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-white">You&apos;re all done!</h2>
                  <p className="text-sm text-white/40">You rated every caption in the deck.</p>
                </div>
                <button
                  onClick={handleRestart}
                  type="button"
                  className="px-7 py-2.5 bg-white/[0.07] hover:bg-violet-500/15 border border-white/15 hover:border-violet-400/35 text-white/90 hover:text-violet-200 font-semibold rounded-full transition-all"
                >
                  Go Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}