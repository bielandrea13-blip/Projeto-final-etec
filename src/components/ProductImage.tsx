import { AudioWaveform } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function ProductImage({
  src,
  alt,
  className = 'aspect-[4/3]',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const cleanSrc = src?.trim();

  if (!cleanSrc || hasError) {
    return (
      <div
        className={`w-full ${className} bg-zinc-100 flex flex-col items-center justify-center p-6 text-center select-none`}
      >
        <div className="w-12 h-12 rounded-xl bg-zinc-200/80 flex items-center justify-center mb-3 text-zinc-500">
          <AudioWaveform className="w-6 h-6" aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-zinc-500 line-clamp-1 max-w-[20ch]">
          {alt || 'Equipamento Kroma'}
        </span>
      </div>
    );
  }

  return (
    <div className={`w-full ${className} bg-zinc-100 overflow-hidden`}>
      <img
        src={cleanSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
      />
    </div>
  );
}
