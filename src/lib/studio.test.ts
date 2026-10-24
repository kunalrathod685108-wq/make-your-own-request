import { describe, it, expect } from 'vitest';
import { studioInput, songPrompt } from './studio';
const input = { context: 'A rainy evening with old friends', mood: 'Chill' as const, genre: 'Acoustic pop' as const, language: 'Hindi' as const, duration: 30 as const, instrumental: false, lyrics: 'Meet me in the rain' };
describe('context to song', () => {
  it('preserves mood and given context', () => { const prompt = songPrompt(studioInput.parse(input)); expect(prompt).toContain('Mood: Chill'); expect(prompt).toContain('A rainy evening with old friends'); });
  it('passes supplied lyrics into the song', () => { expect(songPrompt(input)).toContain('Lyrics:\nMeet me in the rain'); });
  it('omits lyrics for instrumental generation', () => { const prompt = songPrompt({ ...input, instrumental: true }); expect(prompt).toContain('Instrumental only'); expect(prompt).not.toContain('Meet me in the rain'); });
});