import { describe, expect, it } from 'vitest';
import { musicSearchUrl } from './music';

describe('online music lookup', () => {
  it('searches the requested song rather than a fixed playlist', () => {
    const url = new URL(musicSearchUrl('Arijit Singh & rain', 'in'));
    expect(url.searchParams.get('term')).toBe('Arijit Singh & rain');
    expect(url.searchParams.get('entity')).toBe('song');
  });
  it('uses the selected music region', () => {
    expect(new URL(musicSearchUrl('Hello', 'us')).searchParams.get('country')).toBe('us');
    expect(new URL(musicSearchUrl('Hello', 'in')).searchParams.get('country')).toBe('in');
  });
});