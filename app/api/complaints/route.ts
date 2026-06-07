import { NextRequest, NextResponse } from "next/server";
import { getMockDb, saveMockDb, isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { sendNewComplaintEmail } from "@/lib/resend";

// Helper to get client IP
function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "127.0.0.1";
}

// GET /api/complaints
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const wardId = searchParams.get("ward_id");
    const categoryId = searchParams.get("category_id");
    const ticketNo = searchParams.get("ticket_no");

    if (isSupabaseConfigured && supabaseAdmin) {
      // Real Supabase queries
      let query = supabaseAdmin
        .from("complaints")
        .select(`
          *,
          wards (name_ta, name_en),
          categories (name_ta, name_en, icon)
        `);

      if (status) query = query.eq("status", status);
      if (wardId) query = query.eq("ward_id", parseInt(wardId));
      if (categoryId) query = query.eq("category_id", parseInt(categoryId));
      if (ticketNo) query = query.eq("ticket_no", ticketNo);

      // Sort by created_at descending
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Count supports for each complaint
      const enriched = await Promise.all(
        (data || []).map(async (item) => {
          const { count } = await supabaseAdmin!
            .from("issue_supports")
            .select("*", { count: "exact", head: true })
            .eq("complaint_id", item.id);

          return {
            ...item,
            wardName: item.wards ? item.wards.name_en : "Unknown Ward",
            wardNameTa: item.wards ? item.wards.name_ta : "அறியப்படாத வார்டு",
            categoryName: item.categories ? item.categories.name_en : "Unknown Category",
            categoryNameTa: item.categories ? item.categories.name_ta : "அறியப்படாத வகை",
            categoryIcon: item.categories ? item.categories.icon : "📋",
            support_count: count || 0
          };
        })
      );

      return NextResponse.json(enriched);
    } else {
      // Mock File fallback query
      const db = getMockDb();
      let list = [...db.complaints];

      if (status) list = list.filter((c) => c.status === status);
      if (wardId) list = list.filter((c) => c.ward_id === parseInt(wardId));
      if (categoryId) list = list.filter((c) => c.category_id === parseInt(categoryId));
      if (ticketNo) list = list.filter((c) => c.ticket_no.toLowerCase() === ticketNo.toLowerCase());

      // Enrich with ward, category, and upvotes
      const enriched = list.map((item) => {
        const ward = db.volunteers ? db.volunteers.find(() => false) || { name_ta: "", name_en: "" } : { name_ta: "", name_en: "" };
        const dbWards = [
          { id: 1, name_ta: "வார்டு 1 - செல்லூர்", name_en: "Ward 1 - Sellur" },
          { id: 2, name_ta: "வார்டு 2 - அருள் தாஸ் காலனி", name_en: "Ward 2 - Aruldhas Colony" },
          { id: 3, name_ta: "வார்டு 3 - கிருஷ்ணாபுரம்", name_en: "Ward 3 - Krishnapuram" },
          { id: 4, name_ta: "வார்டு 4 - அண்ணா நகர் கிழக்கு", name_en: "Ward 4 - Anna Nagar East" },
          { id: 5, name_ta: "வார்டு 5 - சுப்பிரமணியபுரம்", name_en: "Ward 5 - Subramaniyapuram" },
          { id: 6, name_ta: "வார்டு 6 - கோரிப்பாளையம்", name_en: "Ward 6 - Goripalayam" },
          { id: 7, name_ta: "வார்டு 7 - தெப்பக்குளம்", name_en: "Ward 7 - Teppakulam" },
          { id: 8, name_ta: "வார்டு 8 - அரசரடி", name_en: "Ward 8 - Arasaradi" },
          { id: 9, name_ta: "வார்டு 9 - வண்டியூர்", name_en: "Ward 9 - Vandiyur" },
          { id: 10, name_ta: "இதர பகுதிகள்", name_en: "Other / Not Listed" }
        ];

        const dbCategories = [
          { id: 1, name_ta: "பொது சுகாதாரம்", name_en: "Public Health", icon: "🏥" },
          { id: 2, name_ta: "மின்சாரம்", name_en: "Electricity", icon: "⚡" },
          { id: 3, name_ta: "குடிநீர் வழங்கல்", name_en: "Drinking Water", icon: "💧" },
          { id: 4, name_ta: "கழிவுநீர் பிரச்சனை", name_en: "Drainage / Sewage", icon: "🚰" },
          { id: 5, name_ta: "சாலை & உள் கட்டமைப்பு", name_en: "Road & Infrastructure", icon: "🛣️" },
          { id: 6, name_ta: "குழந்தைகள் துன்புறுத்தல்", name_en: "Child Abuse", icon: "👦" },
          { id: 7, name_ta: "பெண்கள் & முதியவர்கள் துன்புறுத்தல்", name_en: "Women & Elder Abuse", icon: "👵" },
          { id: 8, name_ta: "விலங்குகளை துன்புறுத்தல்", name_en: "Animal Cruelty", icon: "🐕" },
          { id: 9, name_ta: "பொது சொத்து ஆக்கிரமிப்பு", name_en: "Public Property Encroachment", icon: "🏛️" },
          { id: 10, name_ta: "மற்றவை", name_en: "Others", icon: "📋" }
        ];

        const wardMatch = dbWards.find((w) => w.id === item.ward_id);
        const catMatch = dbCategories.find((c) => c.id === item.category_id);
        const supports = db.issue_supports.filter((s: any) => s.complaint_id === item.id).length;

        return {
          ...item,
          wardName: wardMatch ? wardMatch.name_en : "Unknown Ward",
          wardNameTa: wardMatch ? wardMatch.name_ta : "அறியப்படாத வார்டு",
          categoryName: catMatch ? catMatch.name_en : "Unknown Category",
          categoryNameTa: catMatch ? catMatch.name_ta : "அறியப்படாத வகை",
          categoryIcon: catMatch ? catMatch.icon : "📋",
          support_count: supports
        };
      });

      // Sort by created_at descending
      enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return NextResponse.json(enriched);
    }
  } catch (error: any) {
    console.error("API GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/complaints
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, address, ward_id, category_id, title, description, photo_url, document_url, latitude, longitude } = body;

    if (!name || !phone || !address || !ward_id || !category_id || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const wardNameMap: Record<number, string> = {
      1: "Ward 1 - Sellur",
      2: "Ward 2 - Aruldhas Colony",
      3: "Ward 3 - Krishnapuram",
      4: "Ward 4 - Anna Nagar East",
      5: "Ward 5 - Subramaniyapuram",
      6: "Ward 6 - Goripalayam",
      7: "Ward 7 - Teppakulam",
      8: "Ward 8 - Arasaradi",
      9: "Ward 9 - Vandiyur",
      10: "Other / Not Listed"
    };

    const categoryNameMap: Record<number, string> = {
      1: "Public Health",
      2: "Electricity",
      3: "Drinking Water",
      4: "Drainage / Sewage",
      5: "Road & Infrastructure",
      6: "Child Abuse",
      7: "Women & Elder Abuse",
      8: "Animal Cruelty",
      9: "Public Property Encroachment",
      10: "Others"
    };

    let newComplaint: any = null;

    if (isSupabaseConfigured && supabaseAdmin) {
      // 1. Insert into Supabase
      const { data, error } = await supabaseAdmin
        .from("complaints")
        .insert({
          name,
          phone,
          email,
          address,
          ward_id: parseInt(ward_id),
          category_id: parseInt(category_id),
          title,
          description,
          photo_url,
          document_url,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          status: "New"
        })
        .select()
        .single();

      if (error) throw error;
      
      // Fetch ticket_no and created_at because triggers set them
      const { data: updatedData } = await supabaseAdmin
        .from("complaints")
        .select("*")
        .eq("id", data.id)
        .single();

      newComplaint = updatedData;
    } else {
      // 2. Mock JSON save
      const db = getMockDb();
      const nextId = db.complaints.length > 0 ? Math.max(...db.complaints.map((c: any) => c.id)) + 1 : 1;
      const serialNo = db.complaints.length + 1;
      const ticket_no = `TVK-2026-${String(serialNo).padStart(5, "0")}`;
      
      // Calculate initial priority score:
      // Since it's new, age is 0, supports is 0.
      // Similar complaints = same category & ward in the last 30 days
      const similarCount = db.complaints.filter((c: any) => 
        c.ward_id === parseInt(ward_id) && 
        c.category_id === parseInt(category_id) &&
        (Date.now() - new Date(c.created_at).getTime()) <= 30 * 24 * 60 * 60 * 1000
      ).length;

      const priority_score = similarCount * 3; // similar complaints weight = 3
      let priority_level = "Low";
      if (priority_score >= 30) priority_level = "Critical";
      else if (priority_score >= 16) priority_level = "High";
      else if (priority_score >= 5) priority_level = "Medium";

      newComplaint = {
        id: nextId,
        ticket_no,
        name,
        phone,
        email,
        address,
        ward_id: parseInt(ward_id),
        category_id: parseInt(category_id),
        title,
        description,
        photo_url,
        document_url,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        status: "New",
        priority_score,
        priority_level,
        volunteer_id: null,
        admin_notes: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.complaints.push(newComplaint);

      // Re-calculate all priority zones dynamically
      const activeInZone = db.complaints.filter((c: any) => 
        c.ward_id === parseInt(ward_id) && 
        c.category_id === parseInt(category_id) &&
        ['New', 'Assigned', 'In Progress', 'Pending Government Action'].includes(c.status)
      );
      
      const zoneScore = activeInZone.reduce((acc: number, c: any) => acc + c.priority_score, 0);
      let zoneLevel = "Low";
      if (activeInZone.length >= 5) zoneLevel = "Critical";
      else if (activeInZone.length >= 3) zoneLevel = "High";
      else if (activeInZone.length >= 1) zoneLevel = "Medium";

      // Update priority zones cache
      if (!db.priority_zones) db.priority_zones = [];
      const zoneIdx = db.priority_zones.findIndex((z: any) => z.ward_id === parseInt(ward_id) && z.category_id === parseInt(category_id));
      if (zoneIdx >= 0) {
        db.priority_zones[zoneIdx] = { ...db.priority_zones[zoneIdx], level: zoneLevel, score: zoneScore };
      } else {
        db.priority_zones.push({
          id: db.priority_zones.length + 1,
          ward_id: parseInt(ward_id),
          category_id: parseInt(category_id),
          level: zoneLevel,
          score: zoneScore
        });
      }

      saveMockDb(db);
    }

    // 3. Trigger Email Notification via Resend (async, don't block response)
    const wardName = wardNameMap[parseInt(ward_id)] || "Other Ward";
    const categoryName = categoryNameMap[parseInt(category_id)] || "General";
    
    sendNewComplaintEmail({
      ticket_no: newComplaint.ticket_no,
      name,
      phone,
      wardName,
      categoryName,
      title,
      description,
      photo_url
    }).catch(err => console.error("Email send failed inside API:", err));

    return NextResponse.json(newComplaint, { status: 201 });
  } catch (error: any) {
    console.error("API POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
