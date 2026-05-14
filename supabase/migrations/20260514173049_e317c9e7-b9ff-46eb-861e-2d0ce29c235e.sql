CREATE OR REPLACE FUNCTION public.admin_list_users(
  _search text DEFAULT '',
  _limit integer DEFAULT 50,
  _offset integer DEFAULT 0
)
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_admin boolean,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT
      u.id AS user_id,
      u.email::text AS email,
      u.created_at,
      u.last_sign_in_at,
      EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = u.id
          AND ur.role = 'admin'::public.app_role
      ) AS is_admin
    FROM auth.users u
    WHERE COALESCE(_search, '') = ''
       OR u.email ILIKE '%' || _search || '%'
       OR u.id::text ILIKE '%' || _search || '%'
  ), counted AS (
    SELECT filtered.*, count(*) OVER () AS total_count
    FROM filtered
  )
  SELECT counted.user_id, counted.email, counted.created_at, counted.last_sign_in_at, counted.is_admin, counted.total_count
  FROM counted
  ORDER BY counted.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 50), 1), 100)
  OFFSET GREATEST(COALESCE(_offset, 0), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_admin(
  _target_user_id uuid,
  _is_admin boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF _target_user_id IS NULL THEN
    RAISE EXCEPTION 'target user is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = _target_user_id) THEN
    RAISE EXCEPTION 'target user not found';
  END IF;

  IF _is_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target_user_id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    IF _target_user_id = auth.uid() THEN
      RAISE EXCEPTION 'cannot remove your own admin permission';
    END IF;

    DELETE FROM public.user_roles
    WHERE user_id = _target_user_id
      AND role = 'admin'::public.app_role;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users(text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_user_admin(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_admin(uuid, boolean) TO authenticated;