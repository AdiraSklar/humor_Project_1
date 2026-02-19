'use client';

import { useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { handleVote } from './actions';
import type { Caption } from '@/types/caption';

type CaptionsPageProps = {
  captions: Caption[];
  imagesMap: Record<string, string>;
};

// Fisher-Yates shuffle that returns a new shuffled array
const shuffleCopy = <T,>(array: T[]) => {
  const newArray = [...array];
  let currentIndex = newArray.length;

  while (currentIndex > 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }
  return newArray;
};

const cardVariants = {
  enter: {
    x: -300, // ALWAYS enter from left
    opacity: 0,
    scale: 0.95,
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (voteDirection: number) => ({
    zIndex: 0,
    // thumbs up -> swipe right, thumbs down -> swipe left (your existing behavior)
    // if you want BOTH to exit the same way too, tell me and I’ll tweak this.
    x: voteDirection === 1 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

export default function CaptionsPage({ captions, imagesMap }: CaptionsPageProps) {
  // Shuffle ONCE per mount
  const [deck] = useState(() => shuffleCopy(captions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastVoteDirection, setLastVoteDirection] = useState(1);

  // Hidden form to trigger the server action
  const formRef = useRef<HTMLFormElement>(null);
  const captionIdRef = useRef<HTMLInputElement>(null);
  const voteValueRef = useRef<HTMLInputElement>(null);

  const activeCaption = useMemo(() => deck[currentIndex], [deck, currentIndex]);
  const imageUrl = useMemo(
      () => (activeCaption ? imagesMap[activeCaption.image_id] : null),
      [activeCaption, imagesMap]
  );

  const handleVoteClick = (voteDirection: number) => {
    if (!activeCaption || !formRef.current || !captionIdRef.current || !voteValueRef.current) return;

    captionIdRef.current.value = activeCaption.id;
    voteValueRef.current.value = voteDirection.toString();
    setLastVoteDirection(voteDirection);

    formRef.current.requestSubmit();
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
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
        <form ref={formRef} action={handleVote} className="hidden">
          <input type="hidden" name="captionId" ref={captionIdRef} />
          <input type="hidden" name="voteValue" ref={voteValueRef} />
        </form>

        <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
          <p className="font-bold text-xl tracking-wide">
            {currentIndex < deck.length ? `${currentIndex + 1} / ${deck.length}` : `${deck.length} / ${deck.length}`}
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
                    <p className="text-center text-2xl mb-4 flex-shrink-0">
                      {activeCaption?.content}
                    </p>
                  </motion.div>
              ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-bold">You're all done!</h2>
                    <p className="text-gray-300 mt-2 mb-6">You've rated all available captions.</p>
                    <button
                        onClick={handleRestart}
                        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                    >
                      Restart
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
                      className="p-4 bg-white/10 rounded-full text-red-400 hover:bg-white/20 hover:scale-110 transition-transform"
                      aria-label="Downvote"
                      type="button"
                  >
                    <ThumbsDown size={32} />
                  </button>

                  <button
                      onClick={() => handleVoteClick(1)}
                      className="p-4 bg-white/10 rounded-full text-green-400 hover:bg-white/20 hover:scale-110 transition-transform"
                      aria-label="Upvote"
                      type="button"
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