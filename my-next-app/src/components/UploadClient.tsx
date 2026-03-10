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
  presigning: 'Getting upload URL…',
  uploading: 'Uploading image…',
  generating: 'Generating captions…',
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
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => !busy && inputRef.current?.click()}
          disabled={busy}
          type="button"
          className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-full shadow-lg transition-colors"
        >
          <Upload size={18} />
          {history.length > 0 ? 'Upload Another' : 'Upload Image'}
        </button>

        {busy && (
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {STAGE_LABEL[stage]}
          </div>
        )}

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
            className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={24} />
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
                className="w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-4 flex flex-col gap-4"
              >
                <img
                  src={activeItem.preview}
                  alt="Uploaded"
                  className="w-full max-h-64 object-contain rounded-xl bg-black/20"
                />

                <div className="flex flex-col gap-2">
                  <p className="text-xs text-white/50 text-center uppercase tracking-widest">Captions</p>
                  {activeItem.captions.length === 0 ? (
                    <p className="text-center text-white/50 text-sm">No captions returned.</p>
                  ) : (
                    activeItem.captions.map((caption, i) => (
                      <div
                        key={i}
                        className="bg-white/10 rounded-xl px-4 py-3 text-white text-center text-sm"
                      >
                        {caption}
                      </div>
                    ))
                  )}
                </div>

                <p className="text-center text-white/30 text-xs">
                  {activeIndex + 1} / {history.length}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={goRight}
            disabled={activeIndex === history.length - 1}
            type="button"
            className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={24} />
          </button>

        </div>
      )}
    </div>
  );
}