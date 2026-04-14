'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGeneration } from '@/context/GenerationContext';

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
  const abortRef = useRef<AbortController | null>(null);
  const { setIsGenerating } = useGeneration();

  const busy = stage !== 'idle' && stage !== 'error';

  // Keep context in sync so HeaderNav can disable nav links
  useEffect(() => { setIsGenerating(busy); }, [busy, setIsGenerating]);

  // Warn if user tries to refresh/close while generating
  useEffect(() => {
    if (!busy) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [busy]);

  const handleCancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStage('idle');
    if (inputRef.current) inputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setErrorMsg(`Unsupported type: ${file.type}`);
      setStage('error');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    const preview = URL.createObjectURL(file);
    setErrorMsg('');

    try {
      setStage('presigning');
      const presignRes = await fetch('/api/pipeline/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type }),
        signal,
      });
      if (!presignRes.ok) throw new Error((await presignRes.json()).error ?? 'Presign failed');
      const { presignedUrl, cdnUrl } = await presignRes.json();

      setStage('uploading');
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
        signal,
      });
      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);

      setStage('generating');
      const genRes = await fetch('/api/pipeline/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdnUrl }),
        signal,
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
      if (e instanceof Error && e.name === 'AbortError') return; // cancelled — already reset by handleCancel
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setStage('error');
    }

    abortRef.current = null;
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
          className="group flex items-center gap-2.5 px-8 py-3.5 bg-white/[0.07] hover:bg-violet-500/15 border border-white/15 hover:border-violet-400/40 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 hover:text-violet-200 font-semibold text-base rounded-full shadow-xl backdrop-blur-sm transition-all duration-200 tracking-wide"
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
              {/* Stage label */}
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
              {/* Cancel */}
              <button
                onClick={handleCancel}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-white/50 hover:text-white/90 hover:bg-white/[0.1] hover:border-white/25 text-xs font-medium transition-all duration-150"
              >
                <X size={12} />
                Cancel
              </button>
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
            className="shrink-0 p-2 rounded-full bg-white/[0.07] hover:bg-violet-500/15 border border-white/[0.09] hover:border-violet-400/30 text-white/60 hover:text-violet-300 disabled:opacity-15 disabled:cursor-not-allowed transition-all"
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
                className="w-full bg-white/[0.07] border border-white/[0.09] backdrop-blur-2xl rounded-3xl shadow-2xl p-5 flex flex-col gap-5"
              >
                {/* Image */}
                <img
                  src={activeItem.preview}
                  alt="Uploaded"
                  className="w-full max-h-56 object-contain rounded-2xl bg-black/20"
                />

                {/* Captions grid */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] text-white/50 text-center uppercase tracking-[0.22em] font-semibold">Generated Captions</p>
                  {activeItem.captions.length === 0 ? (
                    <p className="text-center text-white/40 text-sm">No captions returned.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {activeItem.captions.map((caption, i) => (
                        <div
                          key={i}
                          className="bg-white/[0.07] hover:bg-violet-500/10 border border-white/[0.09] hover:border-violet-400/30 rounded-xl px-3 py-2.5 text-white/90 hover:text-violet-100 text-center text-xs leading-snug cursor-default transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_16px_rgba(167,139,250,0.1)]"
                        >
                          {caption}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Counter */}
                <p className="text-center text-white/35 text-[10px] tracking-widest font-medium">
                  {activeIndex + 1} / {history.length}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={goRight}
            disabled={activeIndex === history.length - 1}
            type="button"
            className="shrink-0 p-2 rounded-full bg-white/[0.07] hover:bg-violet-500/15 border border-white/[0.09] hover:border-violet-400/30 text-white/60 hover:text-violet-300 disabled:opacity-15 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={20} />
          </button>

        </div>
      )}
    </div>
  );
}