-- ============================================================================
-- TVK Madurai East Constituency Complaint Portal
-- Row Level Security (RLS) Policies
-- ============================================================================
-- Run this AFTER schema.sql and seed.sql have been applied.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------------------------
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints     ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolution_wall ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;

-- Note: wards and categories are public reference data — RLS not required.

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin or super_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is a volunteer
CREATE OR REPLACE FUNCTION is_volunteer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role IN ('volunteer', 'admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (id = auth.uid());

-- Admins can read all user profiles
CREATE POLICY users_select_admin ON users
  FOR SELECT
  USING (is_admin());

-- Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any user profile (e.g., change roles)
CREATE POLICY users_update_admin ON users
  FOR UPDATE
  USING (is_admin());

-- Allow insert for new user registration (via trigger or service role)
CREATE POLICY users_insert ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- COMPLAINTS TABLE POLICIES
-- ============================================================================

-- Public can read complaints marked as public
CREATE POLICY complaints_select_public ON complaints
  FOR SELECT
  USING (is_public = TRUE);

-- Authenticated admin/volunteer can read ALL complaints (including private)
CREATE POLICY complaints_select_staff ON complaints
  FOR SELECT
  USING (is_volunteer());

-- Anonymous users can submit complaints (no auth required)
CREATE POLICY complaints_insert_anon ON complaints
  FOR INSERT
  WITH CHECK (TRUE);

-- Admins can update any complaint (assign, change status, add notes)
CREATE POLICY complaints_update_admin ON complaints
  FOR UPDATE
  USING (is_admin());

-- Volunteers can update complaints assigned to them
CREATE POLICY complaints_update_volunteer ON complaints
  FOR UPDATE
  USING (
    assigned_volunteer_id = auth.uid()
    AND is_volunteer()
  );

-- Admins can delete complaints (soft-delete preferred, but allowed)
CREATE POLICY complaints_delete_admin ON complaints
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- ISSUE_SUPPORTS TABLE POLICIES
-- ============================================================================

-- Anyone can read support counts
CREATE POLICY supports_select_all ON issue_supports
  FOR SELECT
  USING (TRUE);

-- Anonymous users can add support (no auth required)
CREATE POLICY supports_insert_anon ON issue_supports
  FOR INSERT
  WITH CHECK (TRUE);

-- Admins can delete supports (spam cleanup)
CREATE POLICY supports_delete_admin ON issue_supports
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- ANNOUNCEMENTS TABLE POLICIES
-- ============================================================================

-- Anyone can read active announcements
CREATE POLICY announcements_select_all ON announcements
  FOR SELECT
  USING (is_active = TRUE);

-- Admins can read ALL announcements (including inactive)
CREATE POLICY announcements_select_admin ON announcements
  FOR SELECT
  USING (is_admin());

-- Admins can create announcements
CREATE POLICY announcements_insert_admin ON announcements
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update announcements
CREATE POLICY announcements_update_admin ON announcements
  FOR UPDATE
  USING (is_admin());

-- Admins can delete announcements
CREATE POLICY announcements_delete_admin ON announcements
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- RESOLUTION_WALL TABLE POLICIES
-- ============================================================================

-- Anyone can read the resolution wall
CREATE POLICY resolution_wall_select_all ON resolution_wall
  FOR SELECT
  USING (TRUE);

-- Admins can create resolution wall entries
CREATE POLICY resolution_wall_insert_admin ON resolution_wall
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update resolution wall entries
CREATE POLICY resolution_wall_update_admin ON resolution_wall
  FOR UPDATE
  USING (is_admin());

-- Admins can delete resolution wall entries
CREATE POLICY resolution_wall_delete_admin ON resolution_wall
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- VOLUNTEERS TABLE POLICIES
-- ============================================================================

-- Volunteers can see their own record
CREATE POLICY volunteers_select_own ON volunteers
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see all volunteers
CREATE POLICY volunteers_select_admin ON volunteers
  FOR SELECT
  USING (is_admin());

-- Admins can manage volunteers
CREATE POLICY volunteers_insert_admin ON volunteers
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY volunteers_update_admin ON volunteers
  FOR UPDATE
  USING (is_admin());

CREATE POLICY volunteers_delete_admin ON volunteers
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- PRIORITY_ZONES TABLE POLICIES
-- ============================================================================

-- Anyone can read priority zone data (public analytics)
CREATE POLICY priority_zones_select_all ON priority_zones
  FOR SELECT
  USING (TRUE);

-- System/admin managed (inserts/updates via triggers, but admins can also edit)
CREATE POLICY priority_zones_manage_admin ON priority_zones
  FOR ALL
  USING (is_admin());

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Admins can read all notifications
CREATE POLICY notifications_select_admin ON notifications
  FOR SELECT
  USING (is_admin());

-- System can insert notifications (via service role, but policy for admin)
CREATE POLICY notifications_insert_admin ON notifications
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update notification status
CREATE POLICY notifications_update_admin ON notifications
  FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- AUDIT_LOGS TABLE POLICIES
-- ============================================================================

-- Only admins can read audit logs
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT
  USING (is_admin());

-- Only admins can insert audit logs (service role also bypasses RLS)
CREATE POLICY audit_logs_insert_admin ON audit_logs
  FOR INSERT
  WITH CHECK (is_admin());

-- Audit logs are immutable — no update or delete policies

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================
