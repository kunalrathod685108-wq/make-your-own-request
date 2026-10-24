import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { studioInput, songPrompt } from './studio';

export const writeLyrics = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => studioInput.parse(input)).handler(async ({ data }) => {
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) return { lyrics: '', error: 'AI is not configured.' };
  try {
    const { generateLyrics } = await import('./ai/lyrics.server');
    return { lyrics: await generateLyrics(key, data), error: '' };
  } catch (e) { return { lyrics: '', error: safeError(e) }; }
});

function safeError(e: unknown) {
  const error = e as { message?: string; responseBody?: string };
  if (error.responseBody) { try { const body = JSON.parse(error.responseBody); return String(body.error?.message ?? body.message ?? 'AI request failed.'); } catch { /* use message */ } }
  return error.message ?? 'The request could not be completed.';
}

export const createSong = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => studioInput.parse(input)).handler(async ({ data, context }) => {
  const { data: row, error } = await context.supabase.from('generated_songs').insert({ user_id: context.userId, title: data.context.slice(0, 60), context: data.context, mood: data.mood, genre: data.genre, language: data.language, duration: data.duration, instrumental: data.instrumental, lyrics: data.lyrics }).select('id').single();
  if (error || !row) return { id: '', error: 'Could not save this song request.' };
  return { id: row.id, error: '' };
});

export const composeSong = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ data, context }) => {
  const { supabase, userId } = context;
  const { data: song } = await supabase.from('generated_songs').update({ status: 'composing' }).eq('id', data.id).eq('user_id', userId).eq('status', 'pending').select('*').maybeSingle();
  if (!song) return { error: 'This request has already started. Check your saved songs.' };
  try {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) throw new Error('AI is not configured.');
    const settings = studioInput.parse(song);
    let lyrics = song.lyrics;
    if (!settings.instrumental && !lyrics) {
      const { generateLyrics } = await import('./ai/lyrics.server');
      lyrics = await generateLyrics(key, settings);
      await supabase.from('generated_songs').update({ lyrics }).eq('id', song.id);
    }
    const response = await fetch('https://ai.gateway.lovable.dev/v1/music', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: settings.duration === 30 ? 'google/lyria-3-clip-preview' : 'google/lyria-3-pro-preview', input: [{ type: 'user_input', content: [{ type: 'text', text: songPrompt({ ...settings, lyrics }) }] }] }) });
    if (!response.ok) {
      const body = await response.json() as { error?: { message?: string }; message?: string };
      const message = body.error?.message ?? body.message ?? 'Song generation failed.';
      await supabase.from('generated_songs').update({ status: 'failed', error: message, error_status: response.status }).eq('id', song.id);
      return { error: message };
    }
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength) throw new Error('The generated recording was empty.');
    const path = `${userId}/${song.id}.mp3`;
    const { error: uploadError } = await supabase.storage.from('generated-songs').upload(path, bytes, { contentType: 'audio/mpeg', upsert: false });
    if (uploadError) throw new Error('The recording could not be saved.');
    const { error: saveError } = await supabase.from('generated_songs').update({ status: 'ready', audio_path: path, lyrics }).eq('id', song.id);
    if (saveError) throw new Error('Could not finish saving the recording.');
    return { error: '' };
  } catch (e) { const message = safeError(e); await supabase.from('generated_songs').update({ status: 'failed', error: message }).eq('id', song.id); return { error: message }; }
});

export const getStudioLibrary = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [songs, profile] = await Promise.all([context.supabase.from('generated_songs').select('*').eq('user_id', context.userId).order('created_at', { ascending: false }).limit(50), context.supabase.from('profiles').select('*').eq('id', context.userId).maybeSingle()]);
  if (songs.error || profile.error) throw new Error('Could not load your saved songs.');
  return { songs: songs.data ?? [], profile: profile.data };
});

export const songPlayback = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ data, context }) => {
  const { data: song } = await context.supabase.from('generated_songs').select('audio_path').eq('id', data.id).eq('user_id', context.userId).eq('status', 'ready').single();
  if (!song?.audio_path) throw new Error('Recording not available.');
  const storage = context.supabase.storage.from('generated-songs');
  const [play, download] = await Promise.all([storage.createSignedUrl(song.audio_path, 3600), storage.createSignedUrl(song.audio_path, 3600, { download: 'my-ai-song.mp3' })]);
  if (!play.data || !download.data) throw new Error('Could not open this recording.');
  const browserBase = import.meta.env['VITE_SUPABASE_URL'];
  const serverBase = process.env['SUPABASE_URL'];
  const browserUrl = (url: string) => serverBase && browserBase ? url.replace(serverBase, browserBase) : url;
  return { url: browserUrl(play.data.signedUrl), download: browserUrl(download.data.signedUrl) };
});

export const saveMusicProfile = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ display_name: z.string().trim().min(1).max(60), avatar_url: z.union([z.literal(''), z.string().url().startsWith('https://')]) }).parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('profiles').upsert({ id: context.userId, ...data });
  return { error: error ? 'Could not save profile.' : '' };
});