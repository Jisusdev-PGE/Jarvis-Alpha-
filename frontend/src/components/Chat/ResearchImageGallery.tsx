import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Image as ImageIcon, LoaderCircle } from 'lucide-react';
import { searchRelatedImages, type RelatedImage } from '../../lib/image-search';
import type { ResearchSearchTrace } from '../../types';

interface Props {
  traces: ResearchSearchTrace[];
}

export function ResearchImageGallery({ traces }: Props) {
  const query = useMemo(
    () => traces.map((trace) => trace.query.trim()).filter(Boolean).slice(0, 2).join(' '),
    [traces],
  );
  const [images, setImages] = useState<RelatedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    searchRelatedImages(query, controller.signal)
      .then((results) => setImages(results.slice(0, 6)))
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === 'AbortError') return;
        setError(true);
        setImages([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query]);

  if (!query) return null;

  return (
    <section className="mt-4" aria-label="Related research images">
      <div className="flex items-center gap-2 mb-2 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        <ImageIcon size={14} />
        <span>Related images</span>
        <span className="font-normal" style={{ color: 'var(--color-text-tertiary)' }}>· Wikimedia Commons</span>
      </div>
      {loading && images.length === 0 && (
        <div className="flex items-center gap-2 py-3 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          <LoaderCircle size={14} className="animate-spin" />
          Finding images related to this research…
        </div>
      )}
      {error && (
        <p className="text-xs py-2" style={{ color: 'var(--color-text-tertiary)' }}>
          Related images are temporarily unavailable.
        </p>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((image) => (
            <a key={image.id} href={image.pageUrl} target="_blank" rel="noreferrer"
              className="group min-w-0 overflow-hidden rounded-lg border transition-colors"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
              title={image.title}>
              <div className="aspect-[4/3] overflow-hidden">
                <img src={image.imageUrl} alt={image.title} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
              </div>
              <div className="p-2">
                <div className="text-[11px] leading-snug line-clamp-2" style={{ color: 'var(--color-text)' }}>
                  {image.title}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span className="truncate">{[image.creator, image.license].filter(Boolean).join(' · ') || 'View source'}</span>
                  <ExternalLink size={10} className="shrink-0" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
