import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { musicSearchUrl, type MusicResult, type Song } from './music';

const input = z.object({ query: z.string().trim().max(300), country: z.enum(['in', 'us']), mode: z.enum(['ai', 'songs', 'trending']) });

export const searchMusic = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data }): Promise<MusicResult> => {
    let query = data.query;
    try {
      if (data.mode === 'trending') {
        const response = await fetch(`https://itunes.apple.com/${data.country}/rss/topsongs/limit=12/json`);
        if (!response.ok) throw new Error('The live music chart is unavailable right now.');
        const payload = await response.json() as { feed: { entry?: Array<{ 'im:name': { label: string }; 'im:artist': { label: string }; 'im:collection'?: { 'im:name': { label: string } }; 'im:image': Array<{ label: string }>; id: { label: string; attributes: { 'im:id': string } }; link: Array<{ attributes: { rel: string; href: string; type?: string } }> }> } };
        const songs = (payload.feed.entry ?? []).map((entry): Song => ({
          id: entry.id.attributes['im:id'], title: entry['im:name'].label, artist: entry['im:artist'].label,
          album: entry['im:collection']?.['im:name'].label ?? '', artwork: entry['im:image'].at(-1)?.label ?? '',
          url: entry.id.label, preview: entry.link.find(link => link.attributes.type?.startsWith('audio/'))?.attributes.href ?? null,
        }));
        return { songs, query: 'Trending now', source: `iTunes top songs · ${data.country === 'in' ? 'India' : 'United States'}` };
      }
      if (!query) return { songs: [], query, source: '', error: 'Enter a song, artist, or music request.' };
      if (data.mode === 'ai') {
        const key = process.env['LOVABLE_API_KEY'];
        if (!key) return { songs: [], query, source: '', error: 'AI search is not configured yet. Song search is still available.' };
        const { interpretMusicRequest } = await import('./ai/responses.server');
        query = await interpretMusicRequest(key, query);
      }
      const response = await fetch(musicSearchUrl(query, data.country));
      if (!response.ok) throw new Error('Online song search is unavailable right now.');
      const payload = await response.json() as { results: Array<{ trackId: number; trackName: string; artistName: string; collectionName: string; artworkUrl100: string; trackViewUrl: string; previewUrl?: string }> };
      return { query, source: 'iTunes music catalog', songs: payload.results.map(song => ({ id: String(song.trackId), title: song.trackName, artist: song.artistName, album: song.collectionName, artwork: song.artworkUrl100, url: song.trackViewUrl, preview: song.previewUrl ?? null })) };
    } catch (error) {
      const detail = error as { statusCode?: number; responseBody?: string; message?: string };
      let message = detail.message ?? 'Music search failed. Please try again later.';
      if (detail.responseBody) {
        try { const body = JSON.parse(detail.responseBody); message = body.error?.message ?? body.message ?? message; } catch { /* retain safe SDK message */ }
      }
      return { songs: [], query, source: '', error: message };
    }
  });