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
  enter: { x: -300, opacity: 0, scale: 0.95 },
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (voteDirection: number) => ({
    zIndex: 0,
    x: voteDirection === 1 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

export default function CaptionsPage({ captions, imagesMap }: CaptionsPageProps) {
  // IMPORTANT: initialize ONCE from server-provided captions (already randomized in page.tsx)
  const [deck, setDeck] = useState<Caption[]>(() => captions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastVoteDirection, setLastVoteDirection] = useState(1);
  const [isVoting, setIsVoting] = useState(false);

  const activeCaption = useMemo(() => deck[currentIndex], [deck, currentIndex]);

  const imageUrl = useMemo(
      () => (activeCaption ? imagesMap[activeCaption.image_id] : null),
      [activeCaption, imagesMap]
  );

  const handleVoteClick = async (voteDirection: number) => {
    if (isVoting) return;
    if (!activeCaption) return;

    setIsVoting(true);
    setLastVoteDirection(voteDirection);

    const fd = new FormData();
    fd.set('captionId', activeCaption.id);
    fd.set('voteValue', String(voteDirection));

    const res = await handleVote(fd);

    if (res.ok) {
      // Only advance if DB write succeeded
      setCurrentIndex((prev) => prev + 1);
    } else {
      console.error(res.message);
      // Optional: you could show a toast/message here
    }

    // tiny delay prevents double clicks during animation
    setTimeout(() => setIsVoting(false), 250);
  };

  const handleRestart = () => {
    // "Load More" without refetching: just restart the same deck
    setCurrentIndex(0);
  };

  if (deck.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-96">
          <h2 className="text-2xl font-semibold">No captions to rate!</h2>
          <p className="text-gray-400 mt-2">Check back later for more content.</p>
        </div>
    );
  }

  return (
      <div className="flex-1 w-full flex flex-col gap-6 items-center px-2">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
          <p className="font-bold text-xl tracking-wide">
            {currentIndex < deck.length
                ? `${currentIndex + 1} / ${deck.length}`
                : `${deck.length} / ${deck.length}`}
          </p>

          <div className="relative w-full h-[800px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={lastVoteDirection}>
              {currentIndex < deck.length ? (
                  <motion.div
                      key={activeCaption?.id ?? currentIndex}
                      custom={lastVoteDirection}
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="absolute w-full p-4 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg flex flex-col gap-4"
                  >
                    <div className="flex-grow flex items-center justify-center overflow-hidden">
                      {imageUrl && (
                          <img
                              src={imageUrl}
                              alt="Caption image"
                              className="max-w-full max-h-full object-contain rounded-lg"
                          />
                      )}
                    </div>

                    <p className="text-center text-2xl flex-shrink-0">
                      {activeCaption?.content ?? '--- EMPTY CONTENT ---'}
                    </p>
                  </motion.div>
              ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-bold">You&apos;re all done!</h2>
                    <p className="text-gray-300 mt-2 mb-6"></p>
                    <button
                        onClick={handleRestart}
                        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                        type="button"
                    >
                      Load More
                    </button>
                  </div>
              )}
            </AnimatePresence>
          </div>

          {currentIndex < deck.length && (
              <div className="flex items-center flex-col gap-4">
                <div className="flex items-center gap-8">
                  <button
                      onClick={() => handleVoteClick(-1)}
                      className="p-4 bg-white/10 rounded-full text-red-400 hover:bg-white/20 hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      aria-label="Downvote"
                      type="button"
                      disabled={isVoting}
                  >
                    <ThumbsDown size={32} />
                  </button>

                  <button
                      onClick={() => handleVoteClick(1)}
                      className="p-4 bg-white/10 rounded-full text-green-400 hover:bg-white/20 hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      aria-label="Upvote"
                      type="button"
                      disabled={isVoting}
                  >
                    <ThumbsUp size={32} />
                  </button>
                </div>

                <p className="text-xl text-gray-400 mt-2">Rate this caption</p>
              </div>
          )}
        </div>
      </div>
  );
}