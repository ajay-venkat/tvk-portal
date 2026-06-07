import { NextRequest, NextResponse } from "next/server";
import { getMockDb, isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json(data || []);
    } else {
      const db = getMockDb();
      const active = (db.announcements || []).filter((a: any) => a.is_active);
      // Sort by date descending
      active.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return NextResponse.json(active);
    }
  } catch (error: any) {
    console.error("API announcements GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
