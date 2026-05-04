
-- Add user_id to orders for ownership-based access (nullable for guest checkout)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid;

-- Lock down SELECT on orders
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON public.orders;

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow looking up a single order by stripe_session_id (used by success page) without exposing list
-- We keep INSERT permissive (guest checkout) but restrict to non-admin paths via app logic.

-- Storage: lock down product-images uploads to admins only
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
