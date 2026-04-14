
-- Replace broad SELECT policy with path-specific one to prevent listing
DROP POLICY "Product images are publicly accessible" ON storage.objects;

CREATE POLICY "Product images are accessible by path"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images' AND auth.role() = 'anon');
