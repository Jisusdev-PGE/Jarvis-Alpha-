import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  Check,
  Images,
  LayoutGrid,
  LoaderCircle,
  Search,
  Sparkles,
  StretchHorizontal,
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { searchRelatedImages, type RelatedImage } from '../lib/image-search';

type ImageLayout = 'grid' | 'masonry' | 'collage';

const layoutOptions: { id: ImageLayout; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'grid', label: 'Grid', icon: LayoutGrid },
  { id: 'masonry', label: 'Masonry', icon: StretchHorizontal },
  { id: 'collage', label: 'Collage', icon: Images },
];

function ImageCard({ image, featured = false }: { image: RelatedImage; featured?: boolean }) {
  return (
    <article
      className={`group overflow-hidden rounded-xl min-w-0 ${featured ? 'md:row-span-2' : ''}`}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <a href={image.pageUrl} target="_blank" rel="noreferrer" className="block">
        <div className={`overflow-hidden bg-black/5 ${featured ? 'aspect-[4/5]' : 'aspect-[4/3]'}`}>
          <img
            src={image.imageUrl}
            alt={image.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </a>
      <div className="p-3">
        <a href={image.pageUrl} target="_blank" rel="noreferrer" className="block text-xs font-medium leading-5 line-clamp-2 hover:underline" style={{ color: 'var(--color-text)' }}>
          {image.title}
        </a>
        <div className="mt-1 text-[10px] leading-4" style={{ color: 'var(--color-text-tertiary)' }}>
          {image.creator ? <span>{image.creator}</span> : <span>Wikimedia Commons</span>}
          {image.license && <span> · {image.license}</span>}
        </div>
      </div>
    </article>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [images, setImages] = useState<RelatedImage[]>([]);
  const [layout, setLayout] = useState<ImageLayout>('grid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError('');
    setImages([]);
    setSearchedQuery(trimmed);

    try {
      const results = await searchRelatedImages(trimmed, controller.signal);
      if (!controller.signal.aborted) setImages(results);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Could not load related images.');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const startResearch = () => {
    if (!searchedQuery) return;
    localStorage.setItem('jarvis-alpha-pending-search', searchedQuery);
    useAppStore.getState().setDeepResearch(true);
    navigate('/');
  };

  const layoutClass = layout === 'masonry'
    ? 'columns-1 sm:columns-2 lg:columns-3'
    : layout === 'collage'
      ? 'grid grid-cols-2 md:grid-cols-4 auto-rows-[130px] md:auto-rows-[170px]'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] mb-4" style={{ color: 'var(--color-accent)' }}>
          <Sparkles size={14} />
          JARVIS ALPHA / SEARCH
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Search with context.
            </h1>
            <p className="text-sm leading-6 max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
              Find information and explore related images. Arrange the visual results as a grid, masonry gallery or collage.
            </p>
          </div>
          <button
            type="button"
            onClick={startResearch}
            disabled={!searchedQuery}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
          >
            Investigate in Chat <ArrowRight size={15} />
          </button>
        </div>

        <form onSubmit={submit} className="hud-panel p-3 mb-8">
          <label htmlFor="jarvis-search-query" className="sr-only">What do you want to research?</label>
          <textarea
            id="jarvis-search-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={3}
            placeholder="Search a topic, person, place or idea…"
            className="w-full resize-y bg-transparent outline-none text-sm p-3"
            style={{ color: 'var(--color-text)' }}
          />
          <div className="flex items-center justify-between gap-3 px-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Enter to search · Shift + Enter for a new line</span>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
            >
              {loading ? <LoaderCircle size={15} className="animate-spin" /> : <Search size={15} />}
              {loading ? 'Searching' : 'Search'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex items-center gap-2 py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <LoaderCircle size={16} className="animate-spin" /> Finding related images…
          </div>
        )}
        {error && <p role="alert" className="text-sm py-4" style={{ color: 'var(--color-error)' }}>{error}</p>}

        {!loading && searchedQuery && !error && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Related images</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  {images.length} images found for “{searchedQuery}”
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg self-start" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                {layoutOptions.map((option) => {
                  const Icon = option.icon;
                  const active = layout === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLayout(option.id)}
                      aria-pressed={active}
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs transition-colors"
                      style={{
                        background: active ? 'var(--color-surface)' : 'transparent',
                        color: active ? 'var(--color-text)' : 'var(--color-text-tertiary)',
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
                      }}
                    >
                      <Icon size={14} /> {option.label}
                      {active && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {images.length > 0 ? (
              <div className={`${layoutClass} gap-3 [column-gap:12px]`}>
                {images.map((image, index) => (
                  <div key={image.id} className={layout === 'masonry' ? 'mb-3 break-inside-avoid' : layout === 'collage' && index === 0 ? 'col-span-2 row-span-2' : ''}>
                    <ImageCard image={image} featured={layout === 'collage' && index === 0} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl p-8 text-center text-sm" style={{ border: '1px dashed var(--color-border)', color: 'var(--color-text-secondary)' }}>
                No related images were found. Try a broader search phrase.
              </div>
            )}
            <p className="mt-4 text-[10px] leading-5" style={{ color: 'var(--color-text-tertiary)' }}>
              Images are retrieved from Wikimedia Commons. Open an image to view its original page, creator and license details. Availability and reuse terms vary by image.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
