import { useState, useRef } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Search, Sparkles, TrendingUp, Play, Pause, ExternalLink, LoaderCircle, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchMusic } from '@/lib/music.functions';
import type { MusicResult, Song } from '@/lib/music';

export function MusicSearch() {
  const search = useServerFn(searchMusic);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'ai' | 'songs'>('ai');
  const [country, setCountry] = useState<'in' | 'us'>('in');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MusicResult | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  async function run(trending = false) {
    if (busy) return;
    audio.current?.pause(); setPlaying(null); setBusy(true); setResult(null);
    try { setResult(await search({ data: { query, country, mode: trending ? 'trending' : mode } })); }
    catch { setResult({ songs: [], query, source: '', error: 'Music search could not connect. Please try again later.' }); }
    finally { setBusy(false); }
  }
  async function preview(song: Song) {
    const player = audio.current;
    if (!player || !song.preview) return;
    if (playing === song.id) { player.pause(); setPlaying(null); return; }
    player.src = song.preview;
    try { await player.play(); setPlaying(song.id); }
    catch { setPlaying(null); setResult(current => current ? { ...current, error: 'This preview could not play. Open the song to listen online.' } : current); }
  }

  return <section aria-labelledby="music-search-title" className="mx-auto w-full max-w-6xl border-t border-border px-6 py-12">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 id="music-search-title" className="flex items-center gap-3 text-2xl font-bold"><Music2 className="text-primary" /> AI music search</h2>
      <div className="flex items-center gap-3">
        <label htmlFor="music-country" className="text-sm text-muted-foreground">Chart</label>
        <select id="music-country" value={country} onChange={e => setCountry(e.target.value as 'in' | 'us')} className="rounded-md border border-border bg-background p-2 text-sm"><option value="in">India</option><option value="us">United States</option></select>
      </div>
    </div>
    <div className="mt-5 flex flex-wrap gap-2">
      <Button variant={mode === 'ai' ? 'default' : 'outline'} onClick={() => setMode('ai')} aria-pressed={mode === 'ai'}><Sparkles /> AI discovery</Button>
      <Button variant={mode === 'songs' ? 'default' : 'outline'} onClick={() => setMode('songs')} aria-pressed={mode === 'songs'}><Search /> Songs & artists</Button>
      <Button variant="outline" disabled={busy} onClick={() => run(true)}><TrendingUp /> Trending now</Button>
    </div>
    <form className="mt-4 flex gap-2" onSubmit={e => { e.preventDefault(); void run(); }}>
      <label htmlFor="music-query" className="sr-only">Search music</label>
      <Input id="music-query" value={query} maxLength={300} onChange={e => setQuery(e.target.value)} placeholder={mode === 'ai' ? 'Chill Hindi songs for a rainy evening…' : 'Search a song or artist…'} className="h-12 min-w-0 border-border bg-card text-base" />
      <Button type="submit" disabled={busy || !query.trim()} className="h-12 shrink-0" aria-label="Search music">{busy ? <LoaderCircle className="animate-spin" /> : <Search />}<span className="hidden sm:inline">Search</span></Button>
    </form>
    <audio ref={audio} onEnded={() => setPlaying(null)} onError={() => setPlaying(null)} />
    <div aria-live="polite" aria-busy={busy}>
      {busy && <p className="mt-5 text-sm text-muted-foreground">Finding music…</p>}
      {result?.error && <p role="alert" className="mt-5 text-sm text-primary">{result.error}</p>}
      {result && (!result.error || result.songs.length > 0) && <>
        <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm"><p className="font-medium">{result.query}</p><p className="text-muted-foreground">{result.source}</p></div>
        {result.songs.length === 0 && <p className="mt-4 text-muted-foreground">No songs found. Try another song or artist.</p>}
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{result.songs.map(song => <article key={song.id} className="flex min-w-0 gap-3 rounded-lg border border-border bg-card p-3">
          {song.artwork ? <img src={song.artwork} alt={`${song.album || song.title} cover`} loading="lazy" className="size-16 shrink-0 rounded-md object-cover" /> : <Music2 className="size-16 shrink-0 p-3 text-primary" />}
          <div className="min-w-0 flex-1"><h3 className="truncate font-semibold" title={song.title}>{song.title}</h3><p className="truncate text-sm text-muted-foreground" title={song.artist}>{song.artist}</p>
            <div className="mt-2 flex gap-2">{song.preview && <Button variant="outline" size="icon" onClick={() => preview(song)} aria-label={`${playing === song.id ? 'Pause' : 'Preview'} ${song.title}`} title="Play song preview">{playing === song.id ? <Pause /> : <Play />}</Button>}<Button variant="ghost" size="icon" asChild><a href={song.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${song.title} online`} title="Listen online"><ExternalLink /></a></Button></div>
          </div>
        </article>)}</div>
      </>}
    </div>
  </section>;
}