import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Music2, Download, Play, FileText, LoaderCircle, Save, Heart, Smile, CloudRain, Zap, Sunrise, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MusicAccount, useMusicAccount } from './music-account';
import { moods, type StudioInput } from '@/lib/studio';
import { composeSong, createSong, writeLyrics, getStudioLibrary, songPlayback, saveMusicProfile } from '@/lib/studio.functions';
const moodIcons = [Smile, Heart, Headphones, CloudRain, Zap, Sunrise];

export function SongStudio() {
  const { user } = useMusicAccount();
  const create = useServerFn(createSong), compose = useServerFn(composeSong), lyricsFn = useServerFn(writeLyrics), libraryFn = useServerFn(getStudioLibrary), playbackFn = useServerFn(songPlayback), profileFn = useServerFn(saveMusicProfile);
  const [settings, setSettings] = useState<StudioInput>({ context: '', mood: 'Chill', genre: 'Acoustic pop', language: 'Hindi', duration: 30, instrumental: false, lyrics: '' });
  const [busy, setBusy] = useState<'lyrics' | 'song' | null>(null); const [message, setMessage] = useState('');
  const [active, setActive] = useState<{ id: string; url: string; download: string } | null>(null);
  const [name, setName] = useState(''); const [avatar, setAvatar] = useState(''); const [editProfile, setEditProfile] = useState(false);
  const library = useQuery({ queryKey: ['song-library', user?.id], queryFn: () => libraryFn(), enabled: Boolean(user), refetchInterval: busy === 'song' ? 5000 : false });
  async function generate(kind: 'lyrics' | 'song') {
    if (!user) { setMessage('Sign in to create and save your songs.'); return; }
    setBusy(kind); setMessage('');
    try {
      if (kind === 'lyrics') { const result = await lyricsFn({ data: settings }); if (result.error) setMessage(result.error); else setSettings(s => ({ ...s, lyrics: result.lyrics })); }
      else { const job = await create({ data: settings }); if (job.error) setMessage(job.error); else { await library.refetch(); const result = await compose({ data: { id: job.id } }); setMessage(result.error); await library.refetch(); if (!result.error) { const urls = await playbackFn({ data: { id: job.id } }); setActive({ id: job.id, ...urls }); } } }
    } catch { setMessage('Could not finish the request. Check your saved songs before creating another recording.'); }
    finally { setBusy(null); }
  }
  return <section id="song-studio" className="mx-auto max-w-6xl border-t border-border px-6 py-12">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase text-primary">Create something original</p><h2 className="mt-2 flex items-center gap-3 text-3xl font-bold"><Music2 className="text-primary" /> AI song studio</h2></div><MusicAccount /></div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <div><label htmlFor="song-context" className="font-medium">Your story or context</label><Textarea id="song-context" className="mt-2 min-h-28 border-border bg-card" maxLength={2000} value={settings.context} onChange={e => setSettings({ ...settings, context: e.target.value })} placeholder="A Hindi song about meeting old friends on a rainy evening…" /></div>
        <fieldset><legend className="mb-2 font-medium">Mood</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{moods.map((mood, i) => { const Icon = moodIcons[i] ?? Smile; return <Button key={mood} variant={settings.mood === mood ? 'default' : 'outline'} aria-pressed={settings.mood === mood} onClick={() => setSettings({ ...settings, mood })}><Icon />{mood}</Button>; })}</div></fieldset>
        <div className="grid grid-cols-2 gap-3">{(['genre', 'language'] as const).map(field => <label key={field} className="text-sm font-medium capitalize">{field}<select className="mt-2 block h-10 w-full rounded-md border border-border bg-background px-2" value={settings[field]} onChange={e => setSettings({ ...settings, [field]: e.target.value })}>{(field === 'genre' ? ['Acoustic pop', 'Bollywood', 'Lo-fi', 'Electronic', 'Hip-hop', 'Ambient'] : ['Hindi', 'English', 'Gujarati']).map(v => <option key={v}>{v}</option>)}</select></label>)}</div>
        <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.instrumental} onChange={e => setSettings({ ...settings, instrumental: e.target.checked })} />Instrumental only</label><select aria-label="Song length" className="rounded-md border border-border bg-background p-2 text-sm" value={settings.duration} onChange={e => setSettings({ ...settings, duration: e.target.value === '30' ? 30 : 120 })}><option value={30}>30-second clip</option><option value={120}>2-minute song</option></select></div>
        <div className="flex flex-wrap gap-2"><Button disabled={Boolean(busy) || settings.context.trim().length < 3 || settings.instrumental} variant="outline" onClick={() => generate('lyrics')}><FileText />Generate lyrics</Button><Button disabled={Boolean(busy) || settings.context.trim().length < 3} onClick={() => generate('song')}>{busy === 'song' ? <LoaderCircle className="animate-spin" /> : <Sparkles />}Create song</Button></div>
        {busy && <p role="status" className="text-sm text-primary">{busy === 'lyrics' ? 'Writing your lyrics…' : 'Composing and saving your song…'}</p>}{message && <p role="alert" className="text-sm text-primary">{message}</p>}
      </div>
      <div><label htmlFor="song-lyrics" className="font-medium">Lyrics</label><Textarea id="song-lyrics" disabled={settings.instrumental} className="mt-2 min-h-80 border-border bg-card" maxLength={6000} value={settings.lyrics} onChange={e => setSettings({ ...settings, lyrics: e.target.value })} placeholder="Your lyrics…" /></div>
    </div>
    {user && <div className="mt-10 border-t border-border pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">{library.data?.profile?.display_name ? `${library.data.profile.display_name}’s songs` : 'My saved songs'}</h3><Button variant="outline" onClick={() => { setName(library.data?.profile?.display_name ?? ''); setAvatar(library.data?.profile?.avatar_url ?? ''); setEditProfile(!editProfile); }}>Edit profile</Button></div>
      {editProfile && <form className="mt-4 flex flex-wrap gap-2" onSubmit={async e => { e.preventDefault(); try { const r = await profileFn({ data: { display_name: name, avatar_url: avatar } }); setMessage(r.error); if (!r.error) { setEditProfile(false); await library.refetch(); } } catch { setMessage('Enter a name and a valid HTTPS photo URL.'); } }}><Input aria-label="Display name" placeholder="Display name" required maxLength={60} className="max-w-xs" value={name} onChange={e => setName(e.target.value)} /><Input aria-label="Profile photo URL" placeholder="Photo URL (https://…)" className="max-w-xs" value={avatar} onChange={e => setAvatar(e.target.value)} /><Button type="submit"><Save />Save profile</Button></form>}
      {library.isLoading && <p className="mt-4 text-muted-foreground">Loading songs…</p>}{library.error && <p role="alert" className="mt-4 text-primary">Could not load saved songs.</p>}
      {library.data?.songs.length === 0 && <p className="mt-4 text-muted-foreground">No saved songs yet.</p>}
      <div className="mt-4 space-y-3">{library.data?.songs.map(song => <article key={song.id} className="rounded-lg border border-border bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h4 className="break-words font-semibold">{song.title}</h4><p className="mt-1 text-sm text-muted-foreground">{song.mood} · {song.genre} · {song.language} · {song.status}</p></div>{song.status === 'ready' && <Button variant="outline" onClick={async () => { try { const urls = await playbackFn({ data: { id: song.id } }); setActive({ id: song.id, ...urls }); } catch { setMessage('Could not open the recording.'); } }}><Play />Open recording</Button>}</div>
        {song.error && <p className="mt-2 text-sm text-primary">{song.error}</p>}
        {song.lyrics && <details className="mt-3 text-sm"><summary className="cursor-pointer text-primary">Lyrics</summary><p className="mt-2 whitespace-pre-wrap">{song.lyrics}</p></details>}
        {active?.id === song.id && <div className="mt-4 flex flex-wrap items-center gap-3"><audio controls src={active.url} className="max-w-full" /><Button asChild variant="outline"><a href={active.download}><Download />Download MP3</a></Button></div>}
      </article>)}</div>
    </div>}
  </section>;
}