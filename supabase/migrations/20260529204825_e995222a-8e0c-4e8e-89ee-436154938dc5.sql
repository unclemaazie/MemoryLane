
revoke execute on function public.is_owner(uuid) from public, anon;
revoke execute on function public.is_family(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.is_owner(uuid) to authenticated;
grant execute on function public.is_family(uuid) to authenticated;
