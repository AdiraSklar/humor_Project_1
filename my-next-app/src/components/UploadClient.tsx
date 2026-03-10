'use client';

import { useRef, useState } from 'react';
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const SUPPORTED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic',
];

type Stage = 'idle' | 'presigning' | 'uploading' | 'generating' | 'error';

const STAGE_LABEL: Record<Stage, string> = {
  idle: '',
  presigning: 'Cooking up captions ✨',
  uploading: 'Cooking up captions ✨',
  generating: 'Cooking up captions ✨',
  error: '',
};

type UploadItem = { preview: string; captions: string[] };

const cardVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 320 : -320, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -320 : 320, opacity: 0 }),
};

export default function UploadClient() {
  const [stage, setStage] = useState<Stage>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<UploadItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = stage !== 'idle' && stage !== 'error';

  const processFile = async (file: File) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setErrorMsg(`Unsupported type: ${file.type}`);
      setStage('error');
      return;
    }

    const preview = URL.createObjectURL(file);
    setErrorMsg('');

    try {
      setStage('presigning');
      const presignRes = await fetch('/api/pipeline/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error((await presignRes.json()).error ?? 'Presign failed');
      const { presignedUrl, cdnUrl } = await presignRes.json();

      setStage('uploading');
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);

      setStage('generating');
      const genRes = await fetch('/api/pipeline/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdnUrl }),
      });
      if (!genRes.ok) throw new Error((await genRes.json()).error ?? 'Caption generation failed');

      const { captions }: { captions: string[] } = await genRes.json();

      // New card always appended to the right; jump to it
      const nextIndex = history.length;
      setSlideDir(1);
      setHistory(prev => [...prev, { preview, captions: captions ?? [] }]);
      setActiveIndex(nextIndex);
      setStage('idle');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setStage('error');
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const goLeft = () => { setSlideDir(-1); setActiveIndex(i => i - 1); };
  const goRight = () => { setSlideDir(1);  setActiveIndex(i => i + 1); };

  const activeItem = history[activeIndex];

  return (
    <div className="w-full flex flex-col items-center gap-6">

      {/* Upload trigger */}
      <div className="flex flex-col items-center gap-5">
        <button
          onClick={() => !busy && inputRef.current?.click()}
          disabled={busy}
          type="button"
          className="group flex items-center gap-2.5 px-8 py-3.5 bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/50 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base rounded-full shadow-xl backdrop-blur-sm transition-all duration-200 tracking-wide"
          style={{ fontFamily: 'var(--font-lato), sans-serif' }}
        >
          <Upload size={17} className="group-hover:scale-110 transition-transform duration-200" />
          {history.length > 0 ? 'Upload Another' : 'Upload Image'}
        </button>

        <AnimatePresence mode="wait">
          {busy && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Bouncing dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block w-2.5 h-2.5 rounded-full bg-white/60"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  />
                ))}
              </div>
              {/* Stage label — transitions between stages */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-white/75 text-sm font-medium tracking-wide"
                  style={{ fontFamily: 'var(--font-lato), sans-serif' }}
                >
                  {STAGE_LABEL[stage]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === 'error' && (
          <p className="text-red-300 text-sm text-center max-w-sm">{errorMsg}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Card carousel */}
      {history.length > 0 && activeItem && (
        <div className="w-full flex items-center gap-2">

          <button
            onClick={goLeft}
            disabled={activeIndex === 0}
            type="button"
            className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 disabled:opacity-15 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={slideDir} mode="wait">
              <motion.div
                key={activeIndex}
                custom={slideDir}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full bg-white/8 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-5 flex flex-col gap-5"
              >
                {/* Image */}
                <img
                  src={activeItem.preview}
                  alt="Uploaded"
                  className="w-full max-h-56 object-contain rounded-2xl bg-black/20"
                />

                {/* Captions grid */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] text-white/40 text-center uppercase tracking-[0.2em]">Generated Captions</p>
                  {activeItem.captions.length === 0 ? (
                    <p className="text-center text-white/40 text-sm">No captions returned.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {activeItem.captions.map((caption, i) => (
                        <div
                          key={i}
                          className="group/cap relative bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/30 rounded-xl px-3 py-2.5 text-white text-center text-xs leading-snug cursor-default transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-white/10"
                        >
                          {caption}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Counter */}
                <p className="text-center text-white/25 text-[10px] tracking-widest">
                  {activeIndex + 1} / {history.length}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={goRight}
            disabled={activeIndex === history.length - 1}
            type="button"
            className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 disabled:opacity-15 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={20} />
          </button>

        </div>
      )}
    </div>
  );
}