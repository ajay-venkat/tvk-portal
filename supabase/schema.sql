-- ============================================================================
-- TVK Madurai East Constituency Complaint & Civic Engagement Portal
-- Complete PostgreSQL Schema
-- ============================================================================
-- Version: 1.0.0
-- Last Updated: 2026-06-07
-- Description: Production-ready schema for Supabase PostgreSQL with 11 tables,
--              triggers, functions, indexes, and sequences.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE 1: wards
-- Represents the 10 wards in Madurai East constituency
-- ============================================================================
CREATE TABLE IF NOT EXISTS wards (
  id            SERIAL PRIMARY KEY,
  name_ta       VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255) NOT NULL,
  area_code     VARCHAR(20) UNIQUE NOT NULL,
  lat           NUMERIC(10, 8),
  lng           NUMERIC(11, 8),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE wards IS 'Wards within Madurai East constituency';
COMMENT ON COLUMN wards.area_code IS 'Unique short code for the ward (e.g., SELLUR, ANNA_NAGAR_E)';

-- ============================================================================
-- TABLE 2: categories
-- 10 complaint categories (Tamil-first)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id            SERIAL PRIMARY KEY,
  name_ta       VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255) NOT NULL,
  icon          VARCHAR(50) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Complaint categories with Tamil and English names';
COMMENT ON COLUMN categories.slug IS 'URL-friendly unique identifier for the category';

-- ============================================================================
-- TABLE 3: users
-- Extends Supabase auth.users — citizen, volunteer, admin, super_admin
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'citizen'
                CHECK (role IN ('citizen', 'volunteer', 'admin', 'super_admin')),
  phone         VARCHAR(20),
  email         VARCHAR(255),
  ward_id       INTEGER REFERENCES wards(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Application user profiles linked to Supabase auth.users';

-- ============================================================================
-- TABLE 4: complaints
-- Core table — each row is a citizen grievance
-- ============================================================================

-- Sequence for ticket numbering
CREATE SEQUENCE IF NOT EXISTS complaint_ticket_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS complaints (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id             VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
  -- Citizen info (no login required)
  citizen_name          VARCHAR(255) NOT NULL,
  citizen_phone         VARCHAR(20) NOT NULL,
  citizen_email         VARCHAR(255),
  citizen_address       TEXT,
  -- Location & classification
  ward_id               INTEGER NOT NULL REFERENCES wards(id) ON DELETE RESTRICT,
  category_id           INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title                 VARCHAR(500) NOT NULL,
  description           TEXT NOT NULL,
  -- Attachments
  photo_url             VARCHAR(1024),
  document_url          VARCHAR(1024),
  -- Geolocation
  latitude              NUMERIC(10, 8),
  longitude             NUMERIC(11, 8),
  -- Status & priority
  status                VARCHAR(20) NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new', 'assigned', 'in_progress', 'pending_govt', 'resolved', 'closed')),
  priority              VARCHAR(10) NOT NULL DEFAULT 'low'
                        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  priority_score        INTEGER NOT NULL DEFAULT 0,
  -- Assignment
  assigned_volunteer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Notes
  admin_notes           TEXT,
  resolution_notes      TEXT,
  resolution_photo_url  VARCHAR(1024),
  resolved_at           TIMESTAMP WITH TIME ZONE,
  -- Visibility & engagement
  is_public             BOOLEAN NOT NULL DEFAULT TRUE,
  support_count         INTEGER NOT NULL DEFAULT 0,
  -- Timestamps
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE complaints IS 'Core grievance/complaint records filed by citizens';
COMMENT ON COLUMN complaints.ticket_id IS 'Human-readable ticket number in format TVK-YYYY-NNNNN';
COMMENT ON COLUMN complaints.priority_score IS 'Calculated score: support_count + similar_complaints*2 + age_days';

-- ============================================================================
-- TABLE 5: issue_supports
-- "I am facing this too" — citizen upvotes on complaints
-- ============================================================================
CREATE TABLE IF NOT EXISTS issue_supports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id      UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  supporter_phone   VARCHAR(20) NOT NULL,
  supporter_name    VARCHAR(255),
  ip_address        VARCHAR(45),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(complaint_id, supporter_phone)
);

COMMENT ON TABLE issue_supports IS 'Citizen upvotes ("I face this too") on complaint tickets';

-- ============================================================================
-- TABLE 6: announcements
-- Public announcements from MLA office / constituency
-- ============================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ta      VARCHAR(500) NOT NULL,
  title_en      VARCHAR(500) NOT NULL,
  content_ta    TEXT NOT NULL,
  content_en    TEXT NOT NULL,
  type          VARCHAR(20) NOT NULL DEFAULT 'info'
                CHECK (type IN ('info', 'urgent', 'event', 'achievement')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  pinned        BOOLEAN NOT NULL DEFAULT FALSE,
  created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at    TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE announcements IS 'Public announcements and news from the constituency office';

-- ============================================================================
-- TABLE 7: resolution_wall
-- Before/after showcase of resolved complaints
-- ============================================================================
CREATE TABLE IF NOT EXISTS resolution_wall (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id            UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  before_photo_url        VARCHAR(1024) NOT NULL,
  after_photo_url         VARCHAR(1024) NOT NULL,
  resolution_details_ta   TEXT NOT NULL,
  resolution_details_en   TEXT NOT NULL,
  date_completed          DATE NOT NULL DEFAULT CURRENT_DATE,
  is_featured             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE resolution_wall IS 'Before/after showcase gallery of resolved complaints';

-- ============================================================================
-- TABLE 8: volunteers
-- Volunteer profiles and performance tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS volunteers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  ward_id         INTEGER REFERENCES wards(id) ON DELETE SET NULL,
  specialization  VARCHAR(255),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_count  INTEGER NOT NULL DEFAULT 0,
  resolved_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE volunteers IS 'Volunteer profiles with assignment/resolution tracking';

-- ============================================================================
-- TABLE 9: priority_zones
-- Aggregated hotspot analysis by ward + category
-- ============================================================================
CREATE TABLE IF NOT EXISTS priority_zones (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ward_id           INTEGER NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  category_id       INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  complaint_count   INTEGER NOT NULL DEFAULT 0,
  total_support     INTEGER NOT NULL DEFAULT 0,
  priority_score    INTEGER NOT NULL DEFAULT 0,
  priority_level    VARCHAR(10) NOT NULL DEFAULT 'low'
                    CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  last_calculated   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ward_id, category_id)
);

COMMENT ON TABLE priority_zones IS 'Aggregated priority zone analysis per ward + category';

-- ============================================================================
-- TABLE 10: notifications
-- Email/SMS notification log
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255),
  subject         VARCHAR(500),
  body            TEXT,
  complaint_id    UUID REFERENCES complaints(id) ON DELETE SET NULL,
  sent_at         TIMESTAMP WITH TIME ZONE,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Email/SMS notification delivery log';

-- ============================================================================
-- TABLE 11: audit_logs
-- Immutable audit trail for all admin/system actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          VARCHAR(255) NOT NULL,
  entity_type     VARCHAR(100) NOT NULL,
  entity_id       VARCHAR(255),
  old_value       JSONB,
  new_value       JSONB,
  ip_address      VARCHAR(45),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Immutable audit log for all admin and system actions';

-- ============================================================================
-- INDEXES
-- Performance indexes for frequent query patterns
-- ============================================================================

-- Complaints indexes
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_ward_id ON complaints(ward_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category_id ON complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_priority_score ON complaints(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_volunteer ON complaints(assigned_volunteer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_phone ON complaints(citizen_phone);
CREATE INDEX IF NOT EXISTS idx_complaints_ticket_id ON complaints(ticket_id);
CREATE INDEX IF NOT EXISTS idx_complaints_is_public ON complaints(is_public) WHERE is_public = TRUE;

-- Issue supports indexes
CREATE INDEX IF NOT EXISTS idx_issue_supports_complaint_id ON issue_supports(complaint_id);
CREATE INDEX IF NOT EXISTS idx_issue_supports_phone ON issue_supports(supporter_phone);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(pinned) WHERE pinned = TRUE;

-- Resolution wall indexes
CREATE INDEX IF NOT EXISTS idx_resolution_wall_complaint ON resolution_wall(complaint_id);
CREATE INDEX IF NOT EXISTS idx_resolution_wall_featured ON resolution_wall(is_featured) WHERE is_featured = TRUE;

-- Volunteers indexes
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_ward_id ON volunteers(ward_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_active ON volunteers(is_active) WHERE is_active = TRUE;

-- Priority zones indexes
CREATE INDEX IF NOT EXISTS idx_priority_zones_ward ON priority_zones(ward_id);
CREATE INDEX IF NOT EXISTS idx_priority_zones_level ON priority_zones(priority_level);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_complaint ON notifications(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Function: generate_ticket_id()
-- Auto-generates ticket_id in format TVK-YYYY-NNNNN on INSERT
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq  BIGINT;
BEGIN
  IF NEW.ticket_id IS NULL OR NEW.ticket_id = '' THEN
    v_year := EXTRACT(YEAR FROM NOW())::TEXT;
    v_seq  := NEXTVAL('complaint_ticket_seq');
    NEW.ticket_id := 'TVK-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_ticket_id ON complaints;
CREATE TRIGGER trg_generate_ticket_id
  BEFORE INSERT ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_id();

-- ---------------------------------------------------------------------------
-- Function: set_updated_at()
-- Automatically updates the updated_at column on row modification
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_complaints_updated_at ON complaints;
CREATE TRIGGER trg_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Function: get_priority_level(score)
-- Maps a numeric priority score to a priority level string
-- Thresholds: <15 low, <30 medium, <50 high, >=50 critical
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_priority_level(p_score INTEGER)
RETURNS VARCHAR AS $$
BEGIN
  IF p_score < 15 THEN
    RETURN 'low';
  ELSIF p_score < 30 THEN
    RETURN 'medium';
  ELSIF p_score < 50 THEN
    RETURN 'high';
  ELSE
    RETURN 'critical';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- Function: recalculate_complaint_priority()
-- Recalculates priority_score and priority for a complaint.
-- Formula: support_count + (similar_complaints * 2) + age_in_days
-- Similar = same ward + category, created within last 30 days, excluding self
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_complaint_priority()
RETURNS TRIGGER AS $$
DECLARE
  v_support_count   INTEGER;
  v_similar_count   INTEGER;
  v_age_days        INTEGER;
  v_score           INTEGER;
BEGIN
  -- Count support votes
  SELECT COUNT(*)
  INTO v_support_count
  FROM issue_supports
  WHERE complaint_id = NEW.id;

  -- Count similar complaints (same ward + category, last 30 days, not self)
  SELECT COUNT(*)
  INTO v_similar_count
  FROM complaints
  WHERE ward_id = NEW.ward_id
    AND category_id = NEW.category_id
    AND id <> NEW.id
    AND created_at >= (NOW() - INTERVAL '30 days');

  -- Calculate age in days
  v_age_days := GREATEST(0, EXTRACT(DAY FROM (NOW() - NEW.created_at))::INTEGER);

  -- Formula: support_count + similar_complaints*2 + age_days
  v_score := v_support_count + (v_similar_count * 2) + v_age_days;

  NEW.priority_score := v_score;
  NEW.support_count  := v_support_count;
  NEW.priority       := get_priority_level(v_score);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalculate_priority ON complaints;
CREATE TRIGGER trg_recalculate_priority
  BEFORE INSERT OR UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_complaint_priority();

-- ---------------------------------------------------------------------------
-- Function: trigger_priority_recalc_on_support()
-- When a support is added/removed, trigger recalculation on the parent complaint
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_priority_recalc_on_support()
RETURNS TRIGGER AS $$
DECLARE
  v_complaint_id UUID;
BEGIN
  v_complaint_id := COALESCE(NEW.complaint_id, OLD.complaint_id);
  -- Dummy update to fire recalculation trigger on the complaint
  UPDATE complaints
  SET updated_at = NOW()
  WHERE id = v_complaint_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_support_recalc ON issue_supports;
CREATE TRIGGER trg_support_recalc
  AFTER INSERT OR DELETE ON issue_supports
  FOR EACH ROW
  EXECUTE FUNCTION trigger_priority_recalc_on_support();

-- ---------------------------------------------------------------------------
-- Function: update_priority_zones()
-- Maintains the priority_zones aggregation table when complaints change
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_priority_zones()
RETURNS TRIGGER AS $$
DECLARE
  v_complaint_count INTEGER;
  v_total_support   INTEGER;
  v_total_score     INTEGER;
  v_zone_level      VARCHAR(10);
BEGIN
  -- Aggregate active complaints for this ward + category
  SELECT
    COUNT(*),
    COALESCE(SUM(support_count), 0),
    COALESCE(SUM(priority_score), 0)
  INTO v_complaint_count, v_total_support, v_total_score
  FROM complaints
  WHERE ward_id = NEW.ward_id
    AND category_id = NEW.category_id
    AND status IN ('new', 'assigned', 'in_progress', 'pending_govt');

  -- Determine zone priority level
  IF v_total_score >= 50 THEN
    v_zone_level := 'critical';
  ELSIF v_total_score >= 30 THEN
    v_zone_level := 'high';
  ELSIF v_total_score >= 15 THEN
    v_zone_level := 'medium';
  ELSE
    v_zone_level := 'low';
  END IF;

  -- Upsert into priority_zones
  INSERT INTO priority_zones (ward_id, category_id, complaint_count, total_support, priority_score, priority_level, last_calculated)
  VALUES (NEW.ward_id, NEW.category_id, v_complaint_count, v_total_support, v_total_score, v_zone_level, NOW())
  ON CONFLICT (ward_id, category_id)
  DO UPDATE SET
    complaint_count = EXCLUDED.complaint_count,
    total_support   = EXCLUDED.total_support,
    priority_score  = EXCLUDED.priority_score,
    priority_level  = EXCLUDED.priority_level,
    last_calculated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_priority_zones ON complaints;
CREATE TRIGGER trg_update_priority_zones
  AFTER INSERT OR UPDATE OF status, priority_score, ward_id, category_id ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_priority_zones();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
