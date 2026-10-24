export type Song = { id: string; title: string; artist: string; album: string; artwork: string; url: string; preview: string | null };
export type MusicResult = { songs: Song[]; query: string; source: string; error?: string };

export function musicSearchUrl(query: string, country: string) {
  const url = new URL('https://itunes.apple.com/search');
  url.search = new URLSearchParams({ term: query, country, entity: 'song', limit: '12' }).toString();
  return url.toString();
}