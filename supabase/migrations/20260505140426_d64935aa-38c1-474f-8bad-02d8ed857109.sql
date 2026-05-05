
CREATE OR REPLACE FUNCTION public.recompute_order_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed numeric := 0;
  item jsonb;
  prod_price numeric;
  qty int;
  pid uuid;
BEGIN
  IF NEW.items IS NOT NULL AND jsonb_typeof(NEW.items) = 'array' THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
      qty := COALESCE(NULLIF(item->>'quantity','')::int, 0);
      BEGIN
        pid := (item->>'productId')::uuid;
      EXCEPTION WHEN others THEN
        pid := NULL;
      END;
      IF pid IS NOT NULL AND qty > 0 THEN
        SELECT price INTO prod_price FROM public.products WHERE id = pid;
        IF prod_price IS NOT NULL THEN
          computed := computed + (prod_price * qty);
        END IF;
      END IF;
    END LOOP;
  END IF;
  NEW.total_price := computed;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_recompute_total_insert ON public.orders;
CREATE TRIGGER orders_recompute_total_insert
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.recompute_order_total();
