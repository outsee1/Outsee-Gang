
-- Allow service role to manage products (these policies are bypassed by service role anyway, but explicit for clarity)
-- We need update policy on orders for webhook
CREATE POLICY "Service can update orders"
  ON public.orders FOR UPDATE
  USING (true)
  WITH CHECK (true);
