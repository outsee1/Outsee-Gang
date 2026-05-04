
-- Fix order INSERT policy to prevent user_id spoofing
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- Revoke direct EXECUTE on has_role so it can't be called as RPC by clients.
-- RLS policies still evaluate it because they run in the policy/owner context.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
