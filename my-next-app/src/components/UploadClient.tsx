'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
];

type Stage = 'idle' | 'presigning' | 'uploading' | 'generating' | 'done' | 'error';

const STAGE_LABEL: Record<Stage, string> = {
  idle: '',
  presigning: 'Getting upload URL…',
  uploading: 'Uploading image…',
  generating: 'Generating captions…',
  done: '',
  error: '',
};

export default function UploadClient() {
  const [stage, setStage] = useState<Stage>('idle');
  const [captions, setCaptions] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setErrorMsg(`Unsupported type: ${file.type}`);
      setStage('error');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setCaptions([]);
    setErrorMsg('');

    try {
      // 1. Get presigned URL
      setStage('presigning');
      const presignRes = await fetch('/api/pipeline/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error((await presignRes.json()).error ?? 'Presign failed');
      const { presignedUrl, cdnUrl } = await presignRes.json();

      // 2. PUT file directly to the presigned URL
      setStage('uploading');
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Direct upload failed (${putRes.status})`);

      // 3. Register image + generate captions
      setStage('generating');
      const genRes = await fetch('/api/pipeline/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdnUrl }),
      });
      if (!genRes.ok) throw new Error((await genRes.json()).error ?? 'Caption generation failed');

      const genData: { captions: string[] } = await genRes.json();
      setCaptions(genData.captions ?? []);
      setStage('done');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setStage('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setStage('idle');
    setCaptions([]);
    setErrorMsg('');
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const busy = ['presigning', 'uploading', 'generating'].includes(stage);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !busy && inputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors
          ${busy
            ? 'opacity-50 cursor-not-allowed border-white/20'
            : 'border-white/40 hover:border-white/70 hover:bg-white/5 cursor-pointer'
          }`}
      >
        <Upload size={36} className="text-white/70" />
        <p className="text-white/80 text-sm text-center">
          Drag & drop an image, or click to select
        </p>
        <p className="text-white/40 text-xs">JPEG · PNG · WebP · GIF · HEIC</p>
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Preview */}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full max-h-72 object-contain rounded-xl shadow-lg bg-white/5"
        />
      )}

      {/* Progress */}
      {busy && (
        <div className="flex items-center gap-3 text-white/80">
          <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>{STAGE_LABEL[stage]}</span>
        </div>
      )}

      {/* Error */}
      {stage === 'error' && (
        <div className="w-full bg-red-500/20 border border-red-400/40 rounded-xl p-4 text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Captions */}
      {stage === 'done' && (
        <div className="w-full flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-center">Generated Captions</h2>
          {captions.length === 0 ? (
            <p className="text-center text-white/60 text-sm">No captions returned.</p>
          ) : (
            captions.map((caption, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white text-center shadow"
              >
                {caption}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reset */}
      {(stage === 'done' || stage === 'error') && (
        <button
          onClick={reset}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition-colors"
          type="button"
        >
          Upload Another
        </button>
      )}
    </div>
  );
}