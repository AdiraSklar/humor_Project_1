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
  enter: { x: -280, opacity: 0, scale: 0.97 },
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({
    zIndex: 0,
    x: dir === 1 ? 280 : -280,
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

        {/* Counter */}
        <p className="text-sm text-white/50 tracking-widest font-medium">
          {currentIndex < deck.length
            ? `${currentIndex + 1} / ${deck.length}`
            : `${deck.length} / ${deck.length}`}
        </p>

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
                  x: { type: 'spring', stiffness: 500, damping: 35 },
                  opacity: { duration: 0.08 },
                }}
                className="w-full bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Image — edge to edge */}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Caption"
                    className="w-full max-h-80 object-contain bg-black/20"
                  />
                )}

                {/* Caption + votes */}
                <div className="p-5 flex flex-col gap-5">
                  <p className="text-center text-base font-medium leading-snug text-white/90"
                     style={{ fontFamily: 'var(--font-lato), sans-serif' }}>
                    {activeCaption?.content ?? ''}
                  </p>

                  <div className="flex items-center justify-center gap-5">
                    <button
                      onClick={() => handleVoteClick(-1)}
                      disabled={isVoting}
                      type="button"
                      aria-label="Downvote"
                      className="flex flex-col items-center gap-1.5 px-6 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 hover:border-red-400/50 text-red-400 hover:scale-105 transition-all duration-150 disabled:opacity-40"
                    >
                      <ThumbsDown size={24} />
                      <span className="text-xs font-semibold tracking-wide">Nah</span>
                    </button>

                    <button
                      onClick={() => handleVoteClick(1)}
                      disabled={isVoting}
                      type="button"
                      aria-label="Upvote"
                      className="flex flex-col items-center gap-1.5 px-6 py-3.5 rounded-2xl bg-green-500/10 hover:bg-green-500/20 border border-green-400/20 hover:border-green-400/50 text-green-400 hover:scale-105 transition-all duration-150 disabled:opacity-40"
                    >
                      <ThumbsUp size={24} />
                      <span className="text-xs font-semibold tracking-wide">Funny</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-12 flex flex-col items-center gap-5 text-center"
              >
                <h2 className="text-3xl font-bold">You&apos;re all done!</h2>
                <button
                  onClick={handleRestart}
                  type="button"
                  className="px-7 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white font-semibold rounded-full shadow-lg transition-all"
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