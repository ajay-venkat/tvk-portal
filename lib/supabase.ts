import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Supabase environment variables (can be added to .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = supabaseUrl !== "" && supabaseAnonKey !== "";

// Real Supabase Clients
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseAdmin = isSupabaseConfigured && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

// ==========================================
// MOCK FILE-BASED DATABASE ENGINE (Fallback)
// ==========================================
const MOCK_DB_FILE = path.join(process.cwd(), "mock_db.json");

// Default initial data for the portal (seeding)
const DEFAULT_MOCK_DATA = {
  announcements: [
    {
      id: 1,
      title_ta: "செல்லூர் வார்டு அலுவலகத்தில் வெள்ளிக்கிழமை குறைதீர்ப்பு முகாம்",
      title_en: "MLA Grievance Meeting at Sellur Ward Office on Friday",
      content_ta: "மதுரை கிழக்கு சட்டமன்ற உறுப்பினர் எஸ். கார்த்திகேயன் தலைமையில் எதிர்வரும் வெள்ளிக்கிழமை காலை 10 மணி முதல் மதியம் 1 மணி வரை செல்லூர் வார்டு அலுவலகத்தில் பொது மக்கள் குறைதீர்ப்பு முகாம் நடைபெறும்.",
      content_en: "Public grievance redressal meet will be held on coming Friday from 10 AM to 1 PM at Sellur ward office, presided by Madurai East MLA S. Karthikeyan.",
      is_active: true,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title_ta: "மதுரை கிழக்கு மழைக்கால அவசர உதவி எண்கள்",
      title_en: "Madurai East Rain Emergency Help Desk Numbers",
      content_ta: "மழைக்கால அவசர காலங்களில் மக்கள் தொடர்பு கொள்ள வேண்டிய எண்கள்: 0452-2530000, மற்றும் அலைபேசி: 94454-90000.",
      content_en: "Rain emergency numbers for public assistance in Madurai East: 0452-2530000 and mobile: 94454-90000.",
      is_active: true,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  volunteers: [
    { id: 1, name: "Arun Kumar (அருண் குமார்)", phone: "9876543210", ward_id: 1, status: "Active" },
    { id: 2, name: "Malarvizhi (மலர்விழி)", phone: "9765432109", ward_id: 4, status: "Active" },
    { id: 3, name: "Suresh Pandian (சுரேஷ் பாண்டியன்)", phone: "9654321098", ward_id: 6, status: "Active" }
  ],
  complaints: [
    {
      id: 1,
      ticket_no: "TVK-2026-00001",
      name: "Ramanathan M",
      phone: "9845012345",
      email: "ramanathan@example.com",
      address: "12, Sellur Main Road, Madurai East",
      ward_id: 1,
      category_id: 5, // Road & Infrastructure
      title: "Potholes in Sellur Main Road",
      description: "There are large potholes in the main Sellur crossing causing multiple accidents. Heavy rains have made it worse. Water gets logged and it is impossible for two-wheelers to see the holes.",
      photo_url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
      document_url: "",
      latitude: 9.9392,
      longitude: 78.1172,
      status: "Resolved",
      priority_score: 18,
      priority_level: "High",
      volunteer_id: 1,
      admin_notes: "Checked by volunteer. Road repairs initiated by corporation on June 2. Potholes filled with gravel and patch-worked successfully.",
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      ticket_no: "TVK-2026-00002",
      name: "Meenakshi Sundaram",
      phone: "8122345678",
      email: "",
      address: "45, Anna Nagar East Cross Street, Madurai",
      ward_id: 4,
      category_id: 3, // Drinking Water
      title: "Contaminated Water Supply",
      description: "The drinking water supplied for the last 4 days has a strong sewer smell and muddy appearance. Entire street is affected and children are falling sick.",
      photo_url: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=600",
      document_url: "",
      latitude: 9.9220,
      longitude: 78.1390,
      status: "In Progress",
      priority_score: 25,
      priority_level: "High",
      volunteer_id: 2,
      admin_notes: "Water pipe leakage detected near the main valve. Repair works are ongoing. Alternate tanker supply arranged.",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      ticket_no: "TVK-2026-00003",
      name: "Saravanan K",
      phone: "7373123456",
      email: "saravanan@example.com",
      address: "8, Goripalayam Junction, Madurai",
      ward_id: 6,
      category_id: 2, // Electricity
      title: "Broken Streetlight Hanging Dangerously",
      description: "A streetlight pole was hit by a truck near Goripalayam junction. The pole is bent and the heavy light fixture is hanging by a thin wire. It could fall on pedestrians at any time.",
      photo_url: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&q=80&w=600",
      document_url: "",
      latitude: 9.9325,
      longitude: 78.1250,
      status: "New",
      priority_score: 9,
      priority_level: "Medium",
      volunteer_id: null,
      admin_notes: "",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  issue_supports: [
    { id: 1, complaint_id: 1, citizen_ip: "192.168.1.1" },
    { id: 2, complaint_id: 2, citizen_ip: "192.168.1.2" },
    { id: 3, complaint_id: 2, citizen_ip: "192.168.1.3" },
    { id: 4, complaint_id: 2, citizen_ip: "192.168.1.4" }
  ],
  resolution_wall: [
    {
      id: 1,
      complaint_id: 1,
      before_photo_url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
      after_photo_url: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=600",
      resolution_details_ta: "செல்லூர் பிரதான சாலையில் இருந்த ஆபத்தான பள்ளங்கள் தார் ஊற்றி சீரமைக்கப்பட்டு போக்குவரத்து சரிசெய்யப்பட்டது.",
      resolution_details_en: "Dangerous potholes on Sellur Main Road were filled and resurfaced with tar. Normal traffic flow restored.",
      completed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  priority_zones: [
    { id: 1, ward_id: 1, category_id: 5, level: "High", score: 18 },
    { id: 2, ward_id: 4, category_id: 3, level: "High", score: 25 }
  ],
  audit_logs: [
    { id: 1, action: "Complaint Submitted", details: "Ticket TVK-2026-00001 created", created_at: new Date().toISOString() }
  ]
};

// Seed/Load database
export function getMockDb() {
  if (typeof window !== "undefined") {
    // Client side: we call API routes which execute on server, but in case client reads directly:
    return DEFAULT_MOCK_DATA;
  }
  
  if (!fs.existsSync(MOCK_DB_FILE)) {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(DEFAULT_MOCK_DATA, null, 2), "utf-8");
  }
  
  try {
    const data = fs.readFileSync(MOCK_DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading mock database", error);
    return DEFAULT_MOCK_DATA;
  }
}

export function saveMockDb(data: any) {
  if (typeof window === "undefined") {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  }
}
