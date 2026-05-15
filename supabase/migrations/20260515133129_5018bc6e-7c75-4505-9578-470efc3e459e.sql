CREATE TABLE IF NOT EXISTS public.admin_email_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'admin'::public.app_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_email_roles_email_role_key
ON public.admin_email_roles (lower(email), role);

ALTER TABLE public.admin_email_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin email grants" ON public.admin_email_roles;
CREATE POLICY "Admins can view admin email grants"
ON public.admin_email_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can manage admin email grants" ON public.admin_email_roles;
CREATE POLICY "Admins can manage admin email grants"
ON public.admin_email_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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