-- =========================================================================
-- Follow-up to 20260822010000_security_hardening.sql.
--
-- `revoke execute ... from public` there didn't actually close the RPC
-- endpoints — verified via has_function_privilege() that anon and
-- authenticated still had EXECUTE afterward. Supabase's project template
-- grants EXECUTE on every public-schema function to anon/authenticated
-- explicitly (and via `alter default privileges`, to every future one)
-- independent of the PUBLIC pseudo-role, specifically so RPC functions
-- work out of the box without a manual grant each time. That default has
-- to be revoked explicitly per-role, and undone for future functions too.
--
-- is_admin()/owns_host()/owns_listing() are deliberately left untouched —
-- RLS policies for anon/authenticated call them during policy evaluation,
-- so revoking EXECUTE would break every policy that references them.
-- =========================================================================

revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.prevent_role_escalation() from anon, authenticated;
revoke execute on function public.enforce_host_verification_rules() from anon, authenticated;
revoke execute on function public.enforce_listing_publish_rules() from anon, authenticated;
revoke execute on function public.enforce_booking_rules() from anon, authenticated;
revoke execute on function public.adjust_availability_on_booking() from anon, authenticated;
revoke execute on function public.apply_availability_delta(
  uuid, public.listing_type, date, date, date, int, int
) from anon, authenticated;
revoke execute on function public.expire_stale_booking_holds() from anon, authenticated;

-- Stop new functions from getting an automatic anon/authenticated grant;
-- callable RPCs (none exist yet) will need an explicit grant going forward.
alter default privileges in schema public
  revoke execute on functions from anon, authenticated;
