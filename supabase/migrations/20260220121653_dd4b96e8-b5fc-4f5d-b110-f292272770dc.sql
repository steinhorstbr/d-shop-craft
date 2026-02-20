
-- Storage bucket for product photos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-photos', 'product-photos', true);

-- Storage bucket for STL/3MF files (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-files', 'product-files', false);

-- RLS for product photos (public read, store owners write)
CREATE POLICY "Public can view product photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-photos');

CREATE POLICY "Store owners can upload product photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-photos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Store owners can update product photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-photos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Store owners can delete product photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-photos' AND
  auth.uid() IS NOT NULL
);

-- RLS for STL files (authenticated users only, owner access)
CREATE POLICY "Authenticated users can view product files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'product-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Store owners can upload product files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Store owners can delete product files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-files' AND
  auth.uid() IS NOT NULL
);
