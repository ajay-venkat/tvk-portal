/**
 * @fileoverview TypeScript interfaces for TVK Constituency Complaint Portal.
 * Defines all database entity types, API request/response shapes,
 * and filter/stats types used throughout the application.
 */

// ============================================================================
// DATABASE ENTITY TYPES
// ============================================================================

/** User profile — extends Supabase auth.users */
export interface User {
  /** UUID primary key, references auth.users(id) */
  id: string;
  /** Full name of the user */
  full_name: string;
  /** User role */
  role: 'citizen' | 'volunteer' | 'admin' | 'super_admin';
  /** Phone number */
  phone: string | null;
  /** Email address */
  email: string | null;
  /** Assigned ward ID */
  ward_id: number | null;
  /** Account creation timestamp */
  created_at: string;
}

/** Ward — a geographic area in Madurai East constituency */
export interface Ward {
  /** Auto-increment primary key */
  id: number;
  /** Ward name in Tamil */
  name_ta: string;
  /** Ward name in English */
  name_en: string;
  /** Unique area code identifier */
  area_code: string;
  /** Latitude coordinate */
  lat: number | null;
  /** Longitude coordinate */
  lng: number | null;
  /** Creation timestamp */
  created_at: string;
}

/** Category — complaint classification */
export interface Category {
  /** Auto-increment primary key */
  id: number;
  /** Category name in Tamil */
  name_ta: string;
  /** Category name in English */
  name_en: string;
  /** Emoji or icon identifier */
  icon: string;
  /** URL-friendly slug */
  slug: string;
  /** Creation timestamp */
  created_at: string;
}

/** Complaint — core grievance record */
export interface Complaint {
  /** UUID primary key */
  id: string;
  /** Human-readable ticket ID (TVK-YYYY-NNNNN) */
  ticket_id: string;
  /** Name of the citizen filing the complaint */
  citizen_name: string;
  /** Phone number of the citizen */
  citizen_phone: string;
  /** Email of the citizen (optional) */
  citizen_email: string | null;
  /** Address of the citizen (optional) */
  citizen_address: string | null;
  /** Ward ID where the issue is located */
  ward_id: number;
  /** Category ID of the complaint */
  category_id: number;
  /** Complaint title / subject */
  title: string;
  /** Detailed description of the issue */
  description: string;
  /** URL of uploaded photo evidence */
  photo_url: string | null;
  /** URL of uploaded supporting document */
  document_url: string | null;
  /** Latitude of issue location */
  latitude: number | null;
  /** Longitude of issue location */
  longitude: number | null;
  /** Current status */
  status: 'new' | 'assigned' | 'in_progress' | 'pending_govt' | 'resolved' | 'closed';
  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** Calculated priority score */
  priority_score: number;
  /** UUID of assigned volunteer (nullable) */
  assigned_volunteer_id: string | null;
  /** Internal admin notes */
  admin_notes: string | null;
  /** Resolution details / notes */
  resolution_notes: string | null;
  /** URL of resolution proof photo */
  resolution_photo_url: string | null;
  /** Timestamp when complaint was resolved */
  resolved_at: string | null;
  /** Whether complaint is visible to public */
  is_public: boolean;
  /** Number of citizen supports ("I face this too") */
  support_count: number;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/** Complaint with joined ward and category data */
export interface ComplaintWithRelations extends Complaint {
  /** Joined ward data */
  ward?: Ward;
  /** Joined category data */
  category?: Category;
  /** Joined assigned volunteer user data */
  assigned_volunteer?: User | null;
}

/** Issue support — citizen upvote on a complaint */
export interface IssueSupport {
  /** UUID primary key */
  id: string;
  /** Complaint ID being supported */
  complaint_id: string;
  /** Phone number of the supporter */
  supporter_phone: string;
  /** Name of the supporter (optional) */
  supporter_name: string | null;
  /** IP address of the supporter */
  ip_address: string | null;
  /** Support creation timestamp */
  created_at: string;
}

/** Announcement — public news/updates from constituency office */
export interface Announcement {
  /** UUID primary key */
  id: string;
  /** Title in Tamil */
  title_ta: string;
  /** Title in English */
  title_en: string;
  /** Content body in Tamil */
  content_ta: string;
  /** Content body in English */
  content_en: string;
  /** Announcement type */
  type: 'info' | 'urgent' | 'event' | 'achievement';
  /** Whether the announcement is currently active */
  is_active: boolean;
  /** Whether the announcement is pinned to top */
  pinned: boolean;
  /** UUID of the admin who created it */
  created_by: string | null;
  /** Creation timestamp */
  created_at: string;
  /** Optional expiration timestamp */
  expires_at: string | null;
}

/** Resolution wall entry — before/after showcase */
export interface ResolutionEntry {
  /** UUID primary key */
  id: string;
  /** Complaint ID this resolution belongs to */
  complaint_id: string;
  /** URL of photo showing the issue before resolution */
  before_photo_url: string;
  /** URL of photo showing the issue after resolution */
  after_photo_url: string;
  /** Resolution details in Tamil */
  resolution_details_ta: string;
  /** Resolution details in English */
  resolution_details_en: string;
  /** Date the issue was resolved */
  date_completed: string;
  /** Whether this entry is featured on the homepage */
  is_featured: boolean;
  /** Creation timestamp */
  created_at: string;
}

/** Resolution entry with joined complaint data */
export interface ResolutionEntryWithComplaint extends ResolutionEntry {
  /** Joined complaint data */
  complaint?: Complaint;
}

/** Volunteer — volunteer profile with stats */
export interface Volunteer {
  /** UUID primary key */
  id: string;
  /** User ID linked to the volunteer */
  user_id: string;
  /** Volunteer's name */
  name: string;
  /** Volunteer's phone number */
  phone: string;
  /** Assigned ward ID */
  ward_id: number | null;
  /** Area of specialization */
  specialization: string | null;
  /** Whether the volunteer is currently active */
  is_active: boolean;
  /** Number of complaints currently assigned */
  assigned_count: number;
  /** Number of complaints resolved */
  resolved_count: number;
  /** Registration timestamp */
  created_at: string;
}

/** Volunteer with joined user and ward data */
export interface VolunteerWithRelations extends Volunteer {
  /** Joined user data */
  user?: User;
  /** Joined ward data */
  ward?: Ward;
}

/** Priority zone — aggregated hotspot analysis */
export interface PriorityZone {
  /** UUID primary key */
  id: string;
  /** Ward ID */
  ward_id: number;
  /** Category ID */
  category_id: number;
  /** Number of active complaints in this zone */
  complaint_count: number;
  /** Total support votes in this zone */
  total_support: number;
  /** Aggregated priority score */
  priority_score: number;
  /** Zone priority level */
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  /** Last recalculation timestamp */
  last_calculated: string;
  /** Creation timestamp */
  created_at: string;
}

/** Priority zone with joined ward and category data */
export interface PriorityZoneWithRelations extends PriorityZone {
  /** Joined ward data */
  ward?: Ward;
  /** Joined category data */
  category?: Category;
}

/** Notification — email/SMS delivery log */
export interface Notification {
  /** UUID primary key */
  id: string;
  /** Notification type (e.g., 'new_complaint', 'status_change') */
  type: string;
  /** Recipient email address */
  recipient_email: string | null;
  /** Email subject line */
  subject: string | null;
  /** Email/message body */
  body: string | null;
  /** Related complaint ID */
  complaint_id: string | null;
  /** Timestamp when notification was sent */
  sent_at: string | null;
  /** Delivery status */
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  /** Creation timestamp */
  created_at: string;
}

/** Audit log — immutable action log */
export interface AuditLog {
  /** UUID primary key */
  id: string;
  /** User who performed the action */
  user_id: string | null;
  /** Action performed (e.g., 'complaint.create', 'complaint.status_change') */
  action: string;
  /** Type of entity affected */
  entity_type: string;
  /** ID of the affected entity */
  entity_id: string | null;
  /** Previous value (JSON) */
  old_value: Record<string, unknown> | null;
  /** New value (JSON) */
  new_value: Record<string, unknown> | null;
  /** IP address of the requester */
  ip_address: string | null;
  /** Log creation timestamp */
  created_at: string;
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

/** Dashboard statistics summary */
export interface DashboardStats {
  /** Total number of complaints */
  totalComplaints: number;
  /** Number of new/unassigned complaints */
  newComplaints: number;
  /** Number of complaints currently in progress */
  inProgressComplaints: number;
  /** Number of resolved complaints */
  resolvedComplaints: number;
  /** Number of closed complaints */
  closedComplaints: number;
  /** Total number of citizen supports */
  totalSupports: number;
  /** Number of active volunteers */
  activeVolunteers: number;
  /** Average resolution time in days */
  avgResolutionDays: number;
  /** Resolution rate as a percentage (0-100) */
  resolutionRate: number;
  /** Complaints per ward breakdown */
  complaintsPerWard: { wardId: number; wardName: string; count: number }[];
  /** Complaints per category breakdown */
  complaintsPerCategory: { categoryId: number; categoryName: string; count: number }[];
  /** Complaints per status breakdown */
  complaintsPerStatus: { status: string; count: number }[];
  /** Complaints trend over time (last 30 days) */
  complaintsTrend: { date: string; count: number }[];
}

/** Filters for complaint listing/search */
export interface ComplaintFilters {
  /** Filter by status */
  status?: string;
  /** Filter by priority level */
  priority?: string;
  /** Filter by ward ID */
  wardId?: number;
  /** Filter by category ID */
  categoryId?: number;
  /** Full-text search query */
  search?: string;
  /** Filter by assigned volunteer ID */
  volunteerId?: string;
  /** Filter by date range — start */
  dateFrom?: string;
  /** Filter by date range — end */
  dateTo?: string;
  /** Sort field */
  sortBy?: 'created_at' | 'updated_at' | 'priority_score' | 'support_count';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Pagination — page number (1-indexed) */
  page?: number;
  /** Pagination — items per page */
  pageSize?: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Total number of items matching the filters */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/** Request payload for creating a new complaint */
export interface CreateComplaintRequest {
  citizen_name: string;
  citizen_phone: string;
  citizen_email?: string;
  citizen_address?: string;
  ward_id: number;
  category_id: number;
  title: string;
  description: string;
  photo_url?: string;
  document_url?: string;
  latitude?: number;
  longitude?: number;
}

/** Request payload for updating a complaint (admin/volunteer) */
export interface UpdateComplaintRequest {
  status?: string;
  priority?: string;
  assigned_volunteer_id?: string | null;
  admin_notes?: string;
  resolution_notes?: string;
  resolution_photo_url?: string;
  is_public?: boolean;
}

/** Request payload for adding a support to a complaint */
export interface AddSupportRequest {
  complaint_id: string;
  supporter_phone: string;
  supporter_name?: string;
}

/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
