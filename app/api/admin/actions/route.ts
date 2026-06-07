import { NextRequest, NextResponse } from "next/server";
import { getMockDb, saveMockDb, isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, complaint_id, volunteer_id, status, notes, after_photo_url, resolution_details_ta, resolution_details_en, announcement } = body;

    if (isSupabaseConfigured && supabaseAdmin) {
      // Real Supabase administration
      if (action === "update_complaint") {
        const updates: any = {};
        if (status) updates.status = status;
        if (notes !== undefined) updates.admin_notes = notes;
        if (volunteer_id !== undefined) updates.volunteer_id = volunteer_id ? parseInt(volunteer_id) : null;
        
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabaseAdmin
          .from("complaints")
          .update(updates)
          .eq("id", parseInt(complaint_id))
          .select()
          .single();

        if (error) throw error;

        // If status is resolved, and we have resolution details, add to resolution wall
        if (status === "Resolved" && after_photo_url) {
          const { error: wallError } = await supabaseAdmin
            .from("resolution_wall")
            .upsert({
              complaint_id: parseInt(complaint_id),
              before_photo_url: data.photo_url || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
              after_photo_url: after_photo_url,
              resolution_details_ta: resolution_details_ta || "புகார் சரிசெய்யப்பட்டது.",
              resolution_details_en: resolution_details_en || "Complaint resolved.",
              completed_at: new Date().toISOString()
            }, { onConflict: 'complaint_id' });

          if (wallError) throw wallError;
        }

        return NextResponse.json({ success: true, data });
      }

      if (action === "create_announcement") {
        const { title_ta, title_en, content_ta, content_en } = announcement;
        const { data, error } = await supabaseAdmin
          .from("announcements")
          .insert({
            title_ta,
            title_en,
            content_ta,
            content_en,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } else {
      // Mock File Database update logic
      const db = getMockDb();

      if (action === "update_complaint") {
        const cId = parseInt(complaint_id);
        const comp = db.complaints.find((c: any) => c.id === cId);
        if (!comp) {
          return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
        }

        if (status) comp.status = status;
        if (notes !== undefined) comp.admin_notes = notes;
        if (volunteer_id !== undefined) comp.volunteer_id = volunteer_id ? parseInt(volunteer_id) : null;
        comp.updated_at = new Date().toISOString();

        // If status is resolved, and we have resolution details, add to resolution wall
        if (status === "Resolved" && after_photo_url) {
          if (!db.resolution_wall) db.resolution_wall = [];
          const existingWallIdx = db.resolution_wall.findIndex((r: any) => r.complaint_id === cId);
          
          const wallItem = {
            id: existingWallIdx >= 0 ? db.resolution_wall[existingWallIdx].id : db.resolution_wall.length + 1,
            complaint_id: cId,
            before_photo_url: comp.photo_url || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
            after_photo_url: after_photo_url,
            resolution_details_ta: resolution_details_ta || "புகார் சரிசெய்யப்பட்டது.",
            resolution_details_en: resolution_details_en || "Complaint resolved.",
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          };

          if (existingWallIdx >= 0) {
            db.resolution_wall[existingWallIdx] = wallItem;
          } else {
            db.resolution_wall.push(wallItem);
          }
        }

        saveMockDb(db);
        return NextResponse.json({ success: true, data: comp });
      }

      if (action === "create_announcement") {
        const { title_ta, title_en, content_ta, content_en } = announcement;
        if (!db.announcements) db.announcements = [];
        
        const nextId = db.announcements.length > 0 ? Math.max(...db.announcements.map((a: any) => a.id)) + 1 : 1;
        const newAnn = {
          id: nextId,
          title_ta,
          title_en,
          content_ta,
          content_en,
          is_active: true,
          created_at: new Date().toISOString()
        };

        db.announcements.push(newAnn);
        saveMockDb(db);
        return NextResponse.json({ success: true, data: newAnn });
      }

      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("API admin action error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
