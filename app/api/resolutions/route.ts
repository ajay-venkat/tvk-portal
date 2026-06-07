import { NextRequest, NextResponse } from "next/server";
import { getMockDb, isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("resolution_wall")
        .select(`
          *,
          complaints (
            ticket_no,
            title,
            ward_id,
            category_id,
            wards (name_ta, name_en),
            categories (name_ta, name_en, icon)
          )
        `)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((item: any) => {
        const comp = item.complaints || {};
        const ward = comp.wards || {};
        const cat = comp.categories || {};
        return {
          id: item.id,
          complaint_id: item.complaint_id,
          before_photo_url: item.before_photo_url,
          after_photo_url: item.after_photo_url,
          resolution_details_ta: item.resolution_details_ta,
          resolution_details_en: item.resolution_details_en,
          completed_at: item.completed_at,
          ticket_no: comp.ticket_no || "TVK-TICKET",
          title: comp.title || "Resolved Issue",
          wardName: ward.name_en || "Unknown Ward",
          wardNameTa: ward.name_ta || "அறியப்படாத வார்டு",
          categoryName: cat.name_en || "General",
          categoryNameTa: cat.name_ta || "பொது",
          categoryIcon: cat.icon || "📋"
        };
      });

      return NextResponse.json(formatted);
    } else {
      const db = getMockDb();
      const list = [...(db.resolution_wall || [])];

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

      const formatted = list.map((item: any) => {
        const comp = db.complaints.find((c: any) => c.id === item.complaint_id) || {};
        const wardMatch = dbWards.find((w) => w.id === comp.ward_id);
        const catMatch = dbCategories.find((c) => c.id === comp.category_id);

        return {
          id: item.id,
          complaint_id: item.complaint_id,
          before_photo_url: item.before_photo_url,
          after_photo_url: item.after_photo_url,
          resolution_details_ta: item.resolution_details_ta,
          resolution_details_en: item.resolution_details_en,
          completed_at: item.completed_at,
          ticket_no: comp.ticket_no || "TVK-TICKET",
          title: comp.title || "Resolved Issue",
          wardName: wardMatch ? wardMatch.name_en : "Unknown Ward",
          wardNameTa: wardMatch ? wardMatch.name_ta : "அறியப்படாத வார்டு",
          categoryName: catMatch ? catMatch.name_en : "General",
          categoryNameTa: catMatch ? catMatch.name_ta : "பொது",
          categoryIcon: catMatch ? catMatch.icon : "📋"
        };
      });

      // Sort by completed_at descending
      formatted.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
      
      return NextResponse.json(formatted);
    }
  } catch (error: any) {
    console.error("API resolutions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
