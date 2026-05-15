DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

DROP POLICY IF EXISTS "Admins can view admin email grants" ON public.admin_email_roles;
DROP POLICY IF EXISTS "Admins can manage admin email grants" ON public.admin_email_roles;

CREATE POLICY "Users can view their own admin email grants"
ON public.admin_email_roles
FOR SELECT
TO authenticated
USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
  OR EXISTS (
    SELECT 1
    FROM public.admin_email_roles
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;