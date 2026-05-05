CREATE OR REPLACE FUNCTION public.orders_force_pending_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.status := 'pending';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_force_pending_status_insert ON public.orders;
CREATE TRIGGER orders_force_pending_status_insert
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_force_pending_status();

REVOKE EXECUTE ON FUNCTION public.orders_force_pending_status() FROM PUBLIC, anon, authenticated;