-- ============================================================================
-- TVK Madurai East Constituency Complaint Portal
-- Seed Data
-- ============================================================================
-- Run this AFTER schema.sql has been applied.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- WARDS (10 wards in Madurai East constituency)
-- ---------------------------------------------------------------------------
INSERT INTO wards (id, name_ta, name_en, area_code, lat, lng) VALUES
  (1,  'வார்டு 1 - செல்லூர்',               'Ward 1 - Sellur',              'SELLUR',         9.9392, 78.1172),
  (2,  'வார்டு 2 - அருள் தாஸ் காலனி',        'Ward 2 - Aruldhas Colony',     'ARULDHAS',       9.9350, 78.1200),
  (3,  'வார்டு 3 - கிருஷ்ணாபுரம்',           'Ward 3 - Krishnapuram',        'KRISHNAPURAM',   9.9300, 78.1150),
  (4,  'வார்டு 4 - அண்ணா நகர் கிழக்கு',      'Ward 4 - Anna Nagar East',     'ANNA_NAGAR_E',   9.9220, 78.1390),
  (5,  'வார்டு 5 - சுப்பிரமணியபுரம்',        'Ward 5 - Subramaniyapuram',    'SUBRAMANIAPURAM',9.9280, 78.1300),
  (6,  'வார்டு 6 - கோரிப்பாளையம்',           'Ward 6 - Goripalayam',         'GORIPALAYAM',    9.9325, 78.1250),
  (7,  'வார்டு 7 - தெப்பக்குளம்',            'Ward 7 - Teppakulam',          'TEPPAKULAM',     9.9200, 78.1190),
  (8,  'வார்டு 8 - அரசரடி',                  'Ward 8 - Arasaradi',           'ARASARADI',      9.9260, 78.1220),
  (9,  'வார்டு 9 - வண்டியூர்',               'Ward 9 - Vandiyur',            'VANDIYUR',       9.9180, 78.1350),
  (10, 'இதர பகுதிகள்',                       'Other / Not Listed',           'OTHER',          9.9250, 78.1200)
ON CONFLICT (id) DO UPDATE SET
  name_ta   = EXCLUDED.name_ta,
  name_en   = EXCLUDED.name_en,
  area_code = EXCLUDED.area_code,
  lat       = EXCLUDED.lat,
  lng       = EXCLUDED.lng;

-- Reset ward sequence to avoid conflicts
SELECT setval(pg_get_serial_sequence('wards', 'id'), (SELECT MAX(id) FROM wards));

-- ---------------------------------------------------------------------------
-- CATEGORIES (10 complaint categories — Tamil-first)
-- ---------------------------------------------------------------------------
INSERT INTO categories (id, name_ta, name_en, icon, slug) VALUES
  (1,  'பொது சுகாதாரம்',                       'Public Health',                   '🏥', 'public-health'),
  (2,  'மின்சாரம்',                             'Electricity',                     '⚡', 'electricity'),
  (3,  'குடிநீர் வழங்கல்',                      'Drinking Water Supply',           '💧', 'drinking-water'),
  (4,  'கழிவுநீர் பிரச்சனை',                    'Drainage / Sewage',               '🚰', 'drainage-sewage'),
  (5,  'சாலை & உள் கட்டமைப்பு',                 'Road & Infrastructure',           '🛣️', 'road-infrastructure'),
  (6,  'குழந்தைகள் துன்புறுத்தல்',              'Child Abuse',                     '👦', 'child-abuse'),
  (7,  'பெண்கள் & முதியவர்களை துன்புறுத்தல்',   'Women & Elder Abuse',             '👵', 'women-elder-abuse'),
  (8,  'விலங்குகளை துன்புறுத்தல்',              'Animal Cruelty',                  '🐕', 'animal-cruelty'),
  (9,  'பொது சொத்து ஆக்கிரமிப்பு',             'Public Property Encroachment',    '🏛️', 'property-encroachment'),
  (10, 'மற்றவை',                                'Others',                          '📋', 'others')
ON CONFLICT (id) DO UPDATE SET
  name_ta = EXCLUDED.name_ta,
  name_en = EXCLUDED.name_en,
  icon    = EXCLUDED.icon,
  slug    = EXCLUDED.slug;

-- Reset category sequence to avoid conflicts
SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT MAX(id) FROM categories));

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
