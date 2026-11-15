import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { useAppStore } from '../lib/store';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // Queue the prompt for Chat's existing Deep Research pipeline.
    localStorage.setItem('jarvis-alpha-pending-search', trimmed);
    useAppStore.getState().setDeepResearch(true);
    navigate('/');
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] mb-4" style={{ color: 'var(--color-accent)' }}>
          <Sparkles size={14} />
          JARVIS ALPHA / SEARCH
        </div>
        <h1 className="text-3xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Search with context.
        </h1>
        <p className="text-sm leading-6 mb-8 max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
          Ask a research question. JARVIS will open the existing Deep Research workflow in Chat, where you can follow the investigation and review its sources.
        </p>

        <form onSubmit={submit} className="hud-panel p-3">
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
            rows={4}
            placeholder="What do you want to find out?"
            className="w-full resize-y bg-transparent outline-none text-sm p-3"
            style={{ color: 'var(--color-text)' }}
          />
          <div className="flex items-center justify-between gap-3 px-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Enter to search · Shift + Enter for a new line</span>
            <button
              type="submit"
              disabled={!query.trim()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
            >
              <Search size={15} />
              Research
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        <div className="mt-5 flex items-start gap-3 rounded-lg p-4" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <Search size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
          <p className="text-xs leading-5" style={{ color: 'var(--color-text-secondary)' }}>
            Search uses OpenJarvis's existing Deep Research backend. Results and citations depend on the tools and search providers configured on your OpenJarvis server.
          </p>
        </div>
      </div>
    </div>
  );
}
