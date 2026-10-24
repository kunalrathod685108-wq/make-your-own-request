REVOKE EXECUTE ON FUNCTION public.create_music_profile() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_music_profile() TO service_role;