/**
 * @fileoverview Constants for TVK R.K. Nagar Constituency Complaint Portal.
 * Single source of truth for all categories, wards, statuses, priorities,
 * and configuration values. Tamil-first with English translations.
 */

// ============================================================================
// WARD DEFINITIONS
// ============================================================================

/** Ward definition with bilingual names and coordinates */
export interface WardDefinition {
  id: number;
  nameTa: string;
  nameEn: string;
  areaCode: string;
  lat: number;
  lng: number;
}

/** All wards in R.K. Nagar constituency */
export const WARDS: readonly WardDefinition[] = [
  { id: 10, nameTa: 'டாக்டர் ராதாகிருஷ்ணன் நகர் (வடக்கு)', nameEn: 'Dr. Radhakrishnan Nagar (North)', areaCode: 'WARD_10', lat: 13.1250, lng: 80.2850 },
  { id: 11, nameTa: 'செரியன் நகர் (வடக்கு)', nameEn: 'Cheriyan Nagar (North)', areaCode: 'WARD_11', lat: 13.1260, lng: 80.2860 },
  { id: 12, nameTa: 'ஜீவா நகர் (வடக்கு)', nameEn: 'Jeeva Nagar (North)', areaCode: 'WARD_12', lat: 13.1270, lng: 80.2870 },
  { id: 13, nameTa: 'செரியன் நகர் (தெற்கு)', nameEn: 'Cheriyan Nagar (South)', areaCode: 'WARD_13', lat: 13.1230, lng: 80.2850 },
  { id: 14, nameTa: 'ஜீவா நகர் (தெற்கு)', nameEn: 'Jeeva Nagar (South)', areaCode: 'WARD_14', lat: 13.1240, lng: 80.2860 },
  { id: 34, nameTa: 'கொருக்குப்பேட்டை', nameEn: 'Korukkupet', areaCode: 'WARD_34', lat: 13.1150, lng: 80.2780 },
  { id: 35, nameTa: 'மொட்டைத் தோட்டம்', nameEn: 'Mottai Thottam', areaCode: 'WARD_35', lat: 13.1140, lng: 80.2800 },
  { id: 36, nameTa: 'குமாரசாமி நகர் (தெற்கு)', nameEn: 'Kumarasamy Nagar (South)', areaCode: 'WARD_36', lat: 13.1160, lng: 80.2820 },
  { id: 37, nameTa: 'டாக்டர் ராதாகிருஷ்ணன் நகர் (தெற்கு)', nameEn: 'Dr. Radhakrishnan Nagar (South)', areaCode: 'WARD_37', lat: 13.1220, lng: 80.2840 },
  { id: 38, nameTa: 'குமாரசாமி நகர் (வடக்கு)', nameEn: 'Kumarasamy Nagar (North)', areaCode: 'WARD_38', lat: 13.1180, lng: 80.2810 },
  { id: 39, nameTa: 'விஜயராகவலு நகர் (மேற்கு)', nameEn: 'Vijayaragavalu Nagar (West)', areaCode: 'WARD_39', lat: 13.1120, lng: 80.2750 },
  { id: 40, nameTa: 'தண்டையார்பேட்டை', nameEn: 'Tondiarpet', areaCode: 'WARD_40', lat: 13.1280, lng: 80.2890 },
  { id: 41, nameTa: 'பழைய வண்ணாரப்பேட்டை', nameEn: 'Old Washermenpet', areaCode: 'WARD_41', lat: 13.1100, lng: 80.2850 },
  { id: 42, nameTa: 'மீனாட்சியம்மன்பேட்டை', nameEn: 'Meenakshiammanpet', areaCode: 'WARD_42', lat: 13.1110, lng: 80.2880 },
  { id: 99, nameTa: 'இதர பகுதிகள்', nameEn: 'Other / Not Listed', areaCode: 'OTHER', lat: 13.1186, lng: 80.2796 },
] as const;

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

/** Category definition with bilingual names, icon, and slug */
export interface CategoryDefinition {
  id: number;
  nameTa: string;
  nameEn: string;
  icon: string;
  slug: string;
}

/** All 10 complaint categories — Tamil-first */
export const CATEGORIES: readonly CategoryDefinition[] = [
  { id: 1,  nameTa: 'பொது சுகாதாரம்',                       nameEn: 'Public Health',               icon: '🏥', slug: 'public-health' },
  { id: 2,  nameTa: 'மின்சாரம்',                             nameEn: 'Electricity',                 icon: '⚡', slug: 'electricity' },
  { id: 3,  nameTa: 'குடிநீர் வழங்கல்',                      nameEn: 'Drinking Water Supply',       icon: '💧', slug: 'drinking-water' },
  { id: 4,  nameTa: 'கழிவுநீர் பிரச்சனை',                    nameEn: 'Drainage / Sewage',           icon: '🚰', slug: 'drainage-sewage' },
  { id: 5,  nameTa: 'சாலை & உள் கட்டமைப்பு',                 nameEn: 'Road & Infrastructure',       icon: '🛣️', slug: 'road-infrastructure' },
  { id: 6,  nameTa: 'குழந்தைகள் துன்புறுத்தல்',              nameEn: 'Child Abuse',                 icon: '👦', slug: 'child-abuse' },
  { id: 7,  nameTa: 'பெண்கள் & முதியவர்களை துன்புறுத்தல்',   nameEn: 'Women & Elder Abuse',         icon: '👵', slug: 'women-elder-abuse' },
  { id: 8,  nameTa: 'விலங்குகளை துன்புறுத்தல்',              nameEn: 'Animal Cruelty',              icon: '🐕', slug: 'animal-cruelty' },
  { id: 9,  nameTa: 'பொது சொத்து ஆக்கிரமிப்பு',             nameEn: 'Public Property Encroachment', icon: '🏛️', slug: 'property-encroachment' },
  { id: 10, nameTa: 'மற்றவை',                                nameEn: 'Others',                       icon: '📋', slug: 'others' },
] as const;

// ============================================================================
// STATUS DEFINITIONS
// ============================================================================

/** Complaint status type — matches the CHECK constraint in the DB */
export type ComplaintStatus = 'new' | 'assigned' | 'in_progress' | 'pending_govt' | 'resolved' | 'closed';

/** Status definition with bilingual labels and display metadata */
export interface StatusDefinition {
  value: ComplaintStatus;
  labelTa: string;
  labelEn: string;
  icon: string;
  color: string;
  bgColor: string;
}

/** All 6 complaint statuses */
export const STATUSES: readonly StatusDefinition[] = [
  { value: 'new',          labelTa: 'புதிய புகார்',          labelEn: 'New',                    icon: '🆕', color: 'text-blue-700',   bgColor: 'bg-blue-100' },
  { value: 'assigned',     labelTa: 'ஒதுக்கப்பட்டது',       labelEn: 'Assigned',               icon: '👤', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { value: 'in_progress',  labelTa: 'நடைபெறுகிறது',         labelEn: 'In Progress',            icon: '🔄', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { value: 'pending_govt', labelTa: 'அரசு நடவடிக்கை',       labelEn: 'Pending Government',     icon: '🏛️', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { value: 'resolved',     labelTa: 'தீர்வு காணப்பட்டது',   labelEn: 'Resolved',               icon: '✅', color: 'text-green-700',  bgColor: 'bg-green-100' },
  { value: 'closed',       labelTa: 'முடிவு',               labelEn: 'Closed',                 icon: '🔒', color: 'text-gray-700',   bgColor: 'bg-gray-100' },
] as const;

/** Map of status value to definition for quick lookup */
export const STATUS_MAP: Record<ComplaintStatus, StatusDefinition> = Object.fromEntries(
  STATUSES.map((s) => [s.value, s])
) as Record<ComplaintStatus, StatusDefinition>;

// ============================================================================
// PRIORITY DEFINITIONS
// ============================================================================

/** Priority level type — matches the CHECK constraint in the DB */
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

/** Priority definition with bilingual labels and display metadata */
export interface PriorityDefinition {
  value: PriorityLevel;
  labelTa: string;
  labelEn: string;
  icon: string;
  color: string;
  bgColor: string;
  minScore: number;
  maxScore: number;
}

/** All 4 priority levels */
export const PRIORITIES: readonly PriorityDefinition[] = [
  { value: 'low',      labelTa: 'குறைவு',   labelEn: 'Low',      icon: '🟢', color: 'text-green-700',  bgColor: 'bg-green-100',  minScore: 0,  maxScore: 14 },
  { value: 'medium',   labelTa: 'நடுத்தரம்', labelEn: 'Medium',   icon: '🟡', color: 'text-yellow-700', bgColor: 'bg-yellow-100', minScore: 15, maxScore: 29 },
  { value: 'high',     labelTa: 'அதிகம்',    labelEn: 'High',     icon: '🟠', color: 'text-orange-700', bgColor: 'bg-orange-100', minScore: 30, maxScore: 49 },
  { value: 'critical', labelTa: 'அவசரம்',    labelEn: 'Critical', icon: '🔴', color: 'text-red-700',    bgColor: 'bg-red-100',    minScore: 50, maxScore: Infinity },
] as const;

/** Map of priority value to definition for quick lookup */
export const PRIORITY_MAP: Record<PriorityLevel, PriorityDefinition> = Object.fromEntries(
  PRIORITIES.map((p) => [p.value, p])
) as Record<PriorityLevel, PriorityDefinition>;

// ============================================================================
// COMPLAINT FORM CONFIG
// ============================================================================

/** Complaint form field validation rules */
export const COMPLAINT_FORM_CONFIG = {
  /** Citizen name constraints */
  name: {
    minLength: 2,
    maxLength: 255,
    required: true,
  },
  /** Phone number constraints */
  phone: {
    minLength: 10,
    maxLength: 15,
    pattern: /^[6-9]\d{9}$/,
    required: true,
  },
  /** Email constraints */
  email: {
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: false,
  },
  /** Title constraints */
  title: {
    minLength: 5,
    maxLength: 500,
    required: true,
  },
  /** Description constraints */
  description: {
    minLength: 20,
    maxLength: 5000,
    required: true,
  },
  /** Address constraints */
  address: {
    minLength: 10,
    maxLength: 1000,
    required: false,
  },
  /** Photo upload constraints */
  photo: {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    required: false,
  },
  /** Document upload constraints */
  document: {
    maxSizeMB: 10,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    required: false,
  },
} as const;

// ============================================================================
// ANNOUNCEMENT TYPES
// ============================================================================

/** Announcement type values */
export type AnnouncementType = 'info' | 'urgent' | 'event' | 'achievement';

/** Announcement type definitions */
export const ANNOUNCEMENT_TYPES: readonly { value: AnnouncementType; labelTa: string; labelEn: string; icon: string }[] = [
  { value: 'info',        labelTa: 'தகவல்',       labelEn: 'Information',   icon: 'ℹ️' },
  { value: 'urgent',      labelTa: 'அவசரம்',      labelEn: 'Urgent',        icon: '🚨' },
  { value: 'event',       labelTa: 'நிகழ்வு',     labelEn: 'Event',         icon: '📅' },
  { value: 'achievement', labelTa: 'சாதனை',       labelEn: 'Achievement',   icon: '🏆' },
] as const;

// ============================================================================
// USER ROLES
// ============================================================================

/** User role type — matches the CHECK constraint in the DB */
export type UserRole = 'citizen' | 'volunteer' | 'admin' | 'super_admin';

/** User role definitions */
export const USER_ROLES: readonly { value: UserRole; labelTa: string; labelEn: string }[] = [
  { value: 'citizen',     labelTa: 'குடிமகன்',          labelEn: 'Citizen' },
  { value: 'volunteer',   labelTa: 'தன்னார்வலர்',       labelEn: 'Volunteer' },
  { value: 'admin',       labelTa: 'நிர்வாகி',          labelEn: 'Admin' },
  { value: 'super_admin', labelTa: 'தலைமை நிர்வாகி',    labelEn: 'Super Admin' },
] as const;

// ============================================================================
// PORTAL BRANDING
// ============================================================================

/** Portal branding constants */
export const BRANDING = {
  /** Portal name in Tamil */
  nameTa: 'தமிழக வெற்றி கழகம் — ஆர்.கே நகர் தொகுதி குறை தீர்ப்பு மையம்',
  /** Portal name in English */
  nameEn: 'TVK R.K. Nagar Constituency Complaint Portal',
  /** Short name */
  shortName: 'TVK R.K. Nagar',
  /** Constituency name */
  constituency: 'R.K. Nagar',
  /** Party name */
  partyName: 'Tamilaga Vetri Kazhagam',
  /** Party short name */
  partyShortName: 'TVK',
  /** Primary colors (TVK theme) */
  colors: {
    primary: '#1C3557',
    secondary: '#D4920F',
    accent: '#142840',
    background: '#FCFBF9',
  },
} as const;

// ============================================================================
// MISC CONSTANTS
// ============================================================================

/** Number of items per page in complaint listings */
export const PAGE_SIZE = 10;

/** Maximum number of supports allowed per complaint */
export const MAX_SUPPORTS_PER_COMPLAINT = 10000;

/** Default map center (R.K. Nagar) */
export const MAP_CENTER = {
  lat: 13.1186,
  lng: 80.2796,
  zoom: 14,
} as const;
