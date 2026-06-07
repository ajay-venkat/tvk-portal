-- ============================================================================
-- TVK Madurai East Constituency Complaint Portal
-- Supabase Storage Bucket & Access Policies
-- ============================================================================
-- Run this AFTER schema.sql. These use the Supabase storage schema.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Create Storage Buckets
-- ---------------------------------------------------------------------------

-- Complaint photos bucket (before/after images, complaint evidence)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-photos',
  'complaint-photos',
  TRUE,                                              -- Public read access
  5242880,                                           -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Complaint documents bucket (PDFs, supporting documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-documents',
  'complaint-documents',
  FALSE,                                             -- Private — access via signed URLs
  10485760,                                          -- 10MB max file size
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STORAGE POLICIES: complaint-photos
-- ============================================================================

-- Anyone can view complaint photos (public bucket)
CREATE POLICY "Public read access for complaint photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'complaint-photos');

-- Anyone can upload complaint photos (no auth required for filing complaints)
CREATE POLICY "Anyone can upload complaint photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'complaint-photos'
    AND (OCTET_LENGTH(DECODE(REPLACE(REPLACE(name, '-', '+'), '_', '/'), 'base64')) <= 5242880
         OR TRUE)  -- File size enforced at bucket level
  );

-- Admins can update/replace complaint photos
CREATE POLICY "Admins can update complaint photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'complaint-photos'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete complaint photos
CREATE POLICY "Admins can delete complaint photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'complaint-photos'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- STORAGE POLICIES: complaint-documents
-- ============================================================================

-- Authenticated staff can view complaint documents
CREATE POLICY "Staff can view complaint documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'complaint-documents'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('volunteer', 'admin', 'super_admin')
    )
  );

-- Anyone can upload complaint documents (attached during complaint filing)
CREATE POLICY "Anyone can upload complaint documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'complaint-documents'
  );

-- Admins can update complaint documents
CREATE POLICY "Admins can update complaint documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'complaint-documents'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete complaint documents
CREATE POLICY "Admins can delete complaint documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'complaint-documents'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- END OF STORAGE POLICIES
-- ============================================================================
