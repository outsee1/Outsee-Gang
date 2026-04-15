
-- Drop overly permissive policies on product_colors
DROP POLICY IF EXISTS "Anyone can insert product colors" ON public.product_colors;
DROP POLICY IF EXISTS "Anyone can update product colors" ON public.product_colors;
DROP POLICY IF EXISTS "Anyone can delete product colors" ON public.product_colors;

-- Replace with admin-only policies
CREATE POLICY "Admins can insert product colors"
ON public.product_colors FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product colors"
ON public.product_colors FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product colors"
ON public.product_colors FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop overly permissive policies on product_sizes
DROP POLICY IF EXISTS "Anyone can insert product sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Anyone can update product sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Anyone can delete product sizes" ON public.product_sizes;

-- Replace with admin-only policies
CREATE POLICY "Admins can insert product sizes"
ON public.product_sizes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product sizes"
ON public.product_sizes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product sizes"
ON public.product_sizes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop overly permissive policies on orders
DROP POLICY IF EXISTS "Service can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Orders: anyone can create (for checkout), but only admins can update
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
TO public
WITH CHECK (true);
