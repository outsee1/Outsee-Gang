
CREATE POLICY "Anyone can insert product colors"
ON public.product_colors FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update product colors"
ON public.product_colors FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete product colors"
ON public.product_colors FOR DELETE
TO public
USING (true);

CREATE POLICY "Anyone can insert product sizes"
ON public.product_sizes FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update product sizes"
ON public.product_sizes FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete product sizes"
ON public.product_sizes FOR DELETE
TO public
USING (true);
