import { z } from 'zod';
export const moods = ['Happy', 'Romantic', 'Chill', 'Sad', 'Energetic', 'Hopeful'] as const;
export const studioInput = z.object({ context: z.string().trim().min(3).max(2000), mood: z.enum(moods), genre: z.enum(['Acoustic pop', 'Bollywood', 'Lo-fi', 'Electronic', 'Hip-hop', 'Ambient']), language: z.enum(['Hindi', 'English', 'Gujarati']), instrumental: z.boolean(), duration: z.union([z.literal(30), z.literal(120)]), lyrics: z.string().max(6000).default('') });
export type StudioInput = z.infer<typeof studioInput>;
export function songPrompt(data: StudioInput) {
  return `Create an original ${data.duration}-second ${data.genre} song. Mood: ${data.mood}. Language: ${data.language}. ${data.instrumental ? 'Instrumental only, no singing.' : 'Expressive original vocals and a memorable chorus.'}\nStory/context: ${data.context}\n${!data.instrumental && data.lyrics ? `Lyrics:\n${data.lyrics}` : ''}`;
}