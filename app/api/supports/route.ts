import { NextRequest, NextResponse } from "next/server";
import { getMockDb, saveMockDb, isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "127.0.0.1";
}

// POST /api/supports
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { complaint_id } = body;

    if (!complaint_id) {
      return NextResponse.json({ error: "Missing complaint_id" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const numericComplaintId = parseInt(complaint_id);

    if (isSupabaseConfigured && supabaseAdmin) {
      // 1. Check if already supported from this IP in Supabase
      const { data: existing } = await supabaseAdmin
        .from("issue_supports")
        .select("id")
        .eq("complaint_id", numericComplaintId)
        .eq("citizen_ip", ip)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: "You have already supported this issue" }, { status: 409 });
      }

      // 2. Insert support vote
      const { error } = await supabaseAdmin
        .from("issue_supports")
        .insert({
          complaint_id: numericComplaintId,
          citizen_ip: ip
        });

      if (error) throw error;

      // Recalculate will be done automatically by Supabase DB Trigger triggers
      return NextResponse.json({ success: true });
    } else {
      // 3. Mock File DB implementation
      const db = getMockDb();
      
      const existing = db.issue_supports.find(
        (s: any) => s.complaint_id === numericComplaintId && s.citizen_ip === ip
      );

      if (existing) {
        return NextResponse.json({ error: "You have already supported this issue" }, { status: 409 });
      }

      // Add vote
      const nextId = db.issue_supports.length > 0 ? Math.max(...db.issue_supports.map((s: any) => s.id)) + 1 : 1;
      db.issue_supports.push({
        id: nextId,
        complaint_id: numericComplaintId,
        citizen_ip: ip
      });

      // Recalculate parent complaint priority score
      const complaint = db.complaints.find((c: any) => c.id === numericComplaintId);
      if (complaint) {
        const votes = db.issue_supports.filter((s: any) => s.complaint_id === numericComplaintId).length;
        const similarCount = db.complaints.filter((c: any) => 
          c.ward_id === complaint.ward_id && 
          c.category_id === complaint.category_id && 
          c.id !== numericComplaintId &&
          (Date.now() - new Date(c.created_at).getTime()) <= 30 * 24 * 60 * 60 * 1000
        ).length;

        const ageDays = Math.floor((Date.now() - new Date(complaint.created_at).getTime()) / (24 * 60 * 60 * 1000));
        
        // Priority Score = Support Count * 2 + Similar Complaints * 3 + Age in Days
        complaint.priority_score = (votes * 2) + (similarCount * 3) + ageDays;
        
        let priority_level = "Low";
        if (complaint.priority_score >= 30) priority_level = "Critical";
        else if (complaint.priority_score >= 16) priority_level = "High";
        else if (complaint.priority_score >= 5) priority_level = "Medium";
        complaint.priority_level = priority_level;
        complaint.updated_at = new Date().toISOString();

        // Recalculate priority zone for this ward + category
        const activeInZone = db.complaints.filter((c: any) => 
          c.ward_id === complaint.ward_id && 
          c.category_id === complaint.category_id &&
          ['New', 'Assigned', 'In Progress', 'Pending Government Action'].includes(c.status)
        );
        
        const zoneScore = activeInZone.reduce((acc: number, c: any) => acc + c.priority_score, 0);
        let zoneLevel = "Low";
        if (activeInZone.length >= 5) zoneLevel = "Critical";
        else if (activeInZone.length >= 3) zoneLevel = "High";
        else if (activeInZone.length >= 1) zoneLevel = "Medium";

        if (!db.priority_zones) db.priority_zones = [];
        const zoneIdx = db.priority_zones.findIndex((z: any) => z.ward_id === complaint.ward_id && z.category_id === complaint.category_id);
        if (zoneIdx >= 0) {
          db.priority_zones[zoneIdx] = { ...db.priority_zones[zoneIdx], level: zoneLevel, score: zoneScore };
        } else {
          db.priority_zones.push({
            id: db.priority_zones.length + 1,
            ward_id: complaint.ward_id,
            category_id: complaint.category_id,
            level: zoneLevel,
            score: zoneScore
          });
        }
      }

      saveMockDb(db);
      return NextResponse.json({ success: true, new_score: complaint?.priority_score });
    }
  } catch (error: any) {
    console.error("API supports error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
