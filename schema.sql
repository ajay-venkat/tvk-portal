-- Database Schema for TVK Madurai East Constituency Complaint & Civic Engagement Portal

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WARDS TABLE
CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  name_ta VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name_ta VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. USERS TABLE (For citizens, volunteers, admins)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  supabase_uid UUID UNIQUE, -- linked to Supabase Auth user if available
  role VARCHAR(50) NOT NULL DEFAULT 'citizen', -- 'citizen', 'volunteer', 'admin'
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. VOLUNTEERS TABLE
CREATE TABLE IF NOT EXISTS volunteers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Inactive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  ticket_no VARCHAR(50) UNIQUE, -- Auto-generated via trigger (TVK-2026-XXXXX)
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  ward_id INTEGER NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  photo_url VARCHAR(512),
  document_url VARCHAR(512),
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  status VARCHAR(50) NOT NULL DEFAULT 'New', -- 'New', 'Assigned', 'In Progress', 'Pending Government Action', 'Resolved', 'Closed'
  priority_score INTEGER NOT NULL DEFAULT 0, -- Re-calculated via trigger
  priority_level VARCHAR(20) NOT NULL DEFAULT 'Low', -- 'Low', 'Medium', 'High', 'Critical'
  volunteer_id INTEGER REFERENCES volunteers(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ISSUE SUPPORTS (Upvotes: "I Am Facing This Too")
CREATE TABLE IF NOT EXISTS issue_supports (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- if logged in
  citizen_ip VARCHAR(45) NOT NULL, -- prevents duplicate votes from guests
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(complaint_id, citizen_ip)
);

-- 7. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title_ta VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  content_ta TEXT NOT NULL,
  content_en TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. RESOLUTION WALL
CREATE TABLE IF NOT EXISTS resolution_wall (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER UNIQUE NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  before_photo_url VARCHAR(512) NOT NULL,
  after_photo_url VARCHAR(512) NOT NULL,
  resolution_details_ta TEXT NOT NULL,
  resolution_details_en TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- target user
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  message_ta TEXT NOT NULL,
  message_en TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. PRIORITY ZONES (Aggregated cache/view table for analytics hotspots)
CREATE TABLE IF NOT EXISTS priority_zones (
  id SERIAL PRIMARY KEY,
  ward_id INTEGER NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL DEFAULT 'Low',
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ward_id, category_id)
);


-- ==========================================
-- SEED DATA SETUP
-- ==========================================

-- Seed Wards (Madurai East)
INSERT INTO wards (id, name_ta, name_en) VALUES
(1, 'வார்டு 1 - செல்லூர்', 'Ward 1 - Sellur'),
(2, 'வார்டு 2 - அருள் தாஸ் காலனி', 'Ward 2 - Aruldhas Colony'),
(3, 'வார்டு 3 - கிருஷ்ணாபுரம்', 'Ward 3 - Krishnapuram'),
(4, 'வார்டு 4 - அண்ணா நகர் கிழக்கு', 'Ward 4 - Anna Nagar East'),
(5, 'வார்டு 5 - சுப்பிரமணியபுரம்', 'Ward 5 - Subramaniyapuram'),
(6, 'வார்டு 6 - கோரிப்பாளையம்', 'Ward 6 - Goripalayam'),
(7, 'வார்டு 7 - தெப்பக்குளம்', 'Ward 7 - Teppakulam'),
(8, 'வார்டு 8 - அரசரடி', 'Ward 8 - Arasaradi'),
(9, 'வார்டு 9 - வண்டியூர்', 'Ward 9 - Vandiyur'),
(10, 'இதர பகுதிகள்', 'Other / Not Listed')
ON CONFLICT (id) DO NOTHING;

-- Seed Categories
INSERT INTO categories (id, name_ta, name_en, icon) VALUES
(1, 'பொது சுகாதாரம்', 'Public Health', '🏥'),
(2, 'மின்சாரம்', 'Electricity', '⚡'),
(3, 'குடிநீர் வழங்கல்', 'Drinking Water', '💧'),
(4, 'கழிவுநீர் பிரச்சனை', 'Drainage / Sewage', '🚰'),
(5, 'சாலை & உள் கட்டமைப்பு', 'Road & Infrastructure', '🛣️'),
(6, 'குழந்தைகள் துன்புறுத்தல்', 'Child Abuse', '👦'),
(7, 'பெண்கள் & முதியவர்கள் துன்புறுத்தல்', 'Women & Elder Abuse', '👵'),
(8, 'விலங்குகளை துன்புறுத்தல்', 'Animal Cruelty', '🐕'),
(9, 'பொது சொத்து ஆக்கிரமிப்பு', 'Public Property Encroachment', '🏛️'),
(10, 'மற்றவை', 'Others', '📋')
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- PROCEDURES, SEQUENCES AND TRIGGERS
-- ==========================================

-- Ticket Sequence
CREATE SEQUENCE IF NOT EXISTS ticket_seq START WITH 1;

-- 1. Automated Ticket ID Trigger
CREATE OR REPLACE FUNCTION generate_ticket_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_no IS NULL THEN
    NEW.ticket_no := 'TVK-2026-' || LPAD(NEXTVAL('ticket_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_generate_ticket_no
BEFORE INSERT ON complaints
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_no();


-- 2. Priority Score & Level Calculation
CREATE OR REPLACE FUNCTION get_priority_level(score INTEGER)
RETURNS VARCHAR AS $$
BEGIN
  IF score < 5 THEN
    RETURN 'Low';
  ELSIF score < 15 THEN
    RETURN 'Medium';
  ELSIF score < 30 THEN
    RETURN 'High';
  ELSE
    RETURN 'Critical';
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_complaint_priority()
RETURNS TRIGGER AS $$
DECLARE
  v_support_count INTEGER;
  v_similar_count INTEGER;
  v_age_days INTEGER;
  v_score INTEGER;
BEGIN
  -- Count support votes
  SELECT COUNT(*) INTO v_support_count FROM issue_supports WHERE complaint_id = NEW.id;
  
  -- Count similar complaints (same ward and category, created in last 30 days)
  SELECT COUNT(*) INTO v_similar_count FROM complaints 
  WHERE ward_id = NEW.ward_id 
    AND category_id = NEW.category_id 
    AND id <> NEW.id 
    AND created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days');
    
  -- Calculate age in days
  v_age_days := EXTRACT(DAY FROM (CURRENT_TIMESTAMP - NEW.created_at));
  IF v_age_days IS NULL THEN
    v_age_days := 0;
  END IF;

  -- Formula: Priority Score = Support Count * 2 + Similar Complaints * 3 + Age in Days
  v_score := (v_support_count * 2) + (v_similar_count * 3) + v_age_days;
  
  NEW.priority_score := v_score;
  NEW.priority_level := get_priority_level(v_score);
  NEW.updated_at := CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply calculate trigger before updates
CREATE OR REPLACE TRIGGER trigger_calculate_complaint_priority
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION calculate_complaint_priority();

-- Trigger to recalculate score when an upvote (support) is added or deleted
CREATE OR REPLACE FUNCTION recalculate_parent_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger dummy update on parent complaint to force recalculation
  UPDATE complaints 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = COALESCE(NEW.complaint_id, OLD.complaint_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_recalculate_on_support
AFTER INSERT OR DELETE ON issue_supports
FOR EACH ROW
EXECUTE FUNCTION recalculate_parent_priority();


-- 3. Automatic Priority Zone Hotline Detection
-- If a Ward + Category combination has >= 3 active complaints, label as a "High Priority Zone"
CREATE OR REPLACE FUNCTION update_priority_zone()
RETURNS TRIGGER AS $$
DECLARE
  v_complaint_count INTEGER;
  v_total_score INTEGER;
  v_zone_level VARCHAR(20);
BEGIN
  -- Aggregate active complaints for this Ward + Category
  SELECT COUNT(*), COALESCE(SUM(priority_score), 0)
  INTO v_complaint_count, v_total_score
  FROM complaints
  WHERE ward_id = NEW.ward_id 
    AND category_id = NEW.category_id
    AND status IN ('New', 'Assigned', 'In Progress', 'Pending Government Action');

  IF v_complaint_count >= 5 THEN
    v_zone_level := 'Critical';
  ELSIF v_complaint_count >= 3 THEN
    v_zone_level := 'High';
  ELSIF v_complaint_count >= 1 THEN
    v_zone_level := 'Medium';
  ELSE
    v_zone_level := 'Low';
  END IF;

  INSERT INTO priority_zones (ward_id, category_id, level, score, updated_at)
  VALUES (NEW.ward_id, NEW.category_id, v_zone_level, v_total_score, CURRENT_TIMESTAMP)
  ON CONFLICT (ward_id, category_id) 
  DO UPDATE SET 
    level = EXCLUDED.level,
    score = EXCLUDED.score,
    updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_priority_zone
AFTER INSERT OR UPDATE OF status, priority_score, ward_id, category_id ON complaints
FOR EACH ROW
EXECUTE FUNCTION update_priority_zone();
