"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { 
  ShieldCheck, 
  LogOut, 
  BarChart3, 
  Inbox, 
  CheckCircle, 
  Users, 
  FileText, 
  Megaphone, 
  AlertTriangle,
  Upload,
  Check,
  Plus,
  Save,
  Search,
  MapPin,
  TrendingUp,
  ThumbsUp
} from "lucide-react";
import AnalyticsCharts from "@/components/AnalyticsCharts";

interface Complaint {
  id: number;
  ticket_no: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  ward_id: number;
  category_id: number;
  title: string;
  description: string;
  photo_url?: string;
  document_url?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  priority_level: string;
  priority_score: number;
  volunteer_id: number | null;
  admin_notes?: string;
  created_at: string;
  wardName: string;
  wardNameTa: string;
  categoryName: string;
  categoryNameTa: string;
  categoryIcon: string;
  support_count: number;
}

interface Volunteer {
  id: number;
  name: string;
  phone: string;
  ward_id: number;
  status: string;
}

interface HotspotZone {
  wardId: number;
  wardName: string;
  wardNameTa: string;
  categoryId: number;
  categoryName: string;
  categoryNameTa: string;
  categoryIcon: string;
  complaintCount: number;
  totalScore: number;
  level: string;
}

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterWard, setFilterWard] = useState("");
  
  // Selected complaint for actions
  const [selectedComp, setSelectedComp] = useState<Complaint | null>(null);
  
  // Action state bindings
  const [actStatus, setActStatus] = useState("");
  const [actVolunteer, setActVolunteer] = useState("");
  const [actNotes, setActNotes] = useState("");
  const [resolutionPhoto, setResolutionPhoto] = useState<File | null>(null);
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState("");
  const [resDetailsTa, setResDetailsTa] = useState("");
  const [resDetailsEn, setResDetailsEn] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Announcement state bindings
  const [annTitleTa, setAnnTitleTa] = useState("");
  const [annTitleEn, setAnnTitleEn] = useState("");
  const [annContentTa, setAnnContentTa] = useState("");
  const [annContentEn, setAnnContentEn] = useState("");
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [annSuccess, setAnnSuccess] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Wards and Categories definition
  const WARDS = [
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

  const CATEGORIES = [
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

  useEffect(() => {
    // Authenticate Admin
    const auth = localStorage.getItem("tvk_admin_auth");
    if (auth !== "true") {
      router.push("/admin/login");
    } else {
      setAuthorized(true);
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch complaints
      const resComp = await fetch("/api/complaints");
      const dataComp = await resComp.json();
      setComplaints(dataComp);

      // Seed mock volunteers if mock DB
      const mockVolunteers: Volunteer[] = [
        { id: 1, name: "Arun Kumar (அருண் குமார்)", phone: "9876543210", ward_id: 1, status: "Active" },
        { id: 2, name: "Malarvizhi (மலர்விழி)", phone: "9765432109", ward_id: 4, status: "Active" },
        { id: 3, name: "Suresh Pandian (சுரேஷ் பாண்டியன்)", phone: "9654321098", ward_id: 6, status: "Active" }
      ];
      setVolunteers(mockVolunteers);
    } catch (error) {
      console.error("Dashboard load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tvk_admin_auth");
    router.push("/admin/login");
  };

  const handleSelectComplaint = (comp: Complaint) => {
    setSelectedComp(comp);
    setActStatus(comp.status);
    setActVolunteer(comp.volunteer_id ? String(comp.volunteer_id) : "");
    setActNotes(comp.admin_notes || "");
    setResolutionPhoto(null);
    setResolutionPhotoUrl("");
    setResDetailsTa("");
    setResDetailsEn("");
  };

  const handleResolutionPhotoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResolutionPhotoUrl(data.url);
      }
    } catch (error) {
      console.error("Resolution upload error:", error);
    }
  };

  const handleSaveComplaintAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComp) return;

    setActionLoading(true);
    try {
      const payload = {
        action: "update_complaint",
        complaint_id: selectedComp.id,
        status: actStatus,
        volunteer_id: actVolunteer ? parseInt(actVolunteer) : null,
        notes: actNotes,
        after_photo_url: resolutionPhotoUrl,
        resolution_details_ta: resDetailsTa,
        resolution_details_en: resDetailsEn
      };

      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSelectedComp(null);
        await loadDashboardData();
      } else {
        alert("Update Failed");
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitleTa || !annTitleEn || !annContentTa || !annContentEn) return;

    setAnnSubmitting(true);
    setAnnSuccess(false);

    try {
      const payload = {
        action: "create_announcement",
        announcement: {
          title_ta: annTitleTa,
          title_en: annTitleEn,
          content_ta: annContentTa,
          content_en: annContentEn
        }
      };

      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAnnTitleTa("");
        setAnnTitleEn("");
        setAnnContentTa("");
        setAnnContentEn("");
        setAnnSuccess(true);
        setTimeout(() => setAnnSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Announcement add error:", error);
    } finally {
      setAnnSubmitting(false);
    }
  };

  if (!authorized || loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F4F2EE] text-sm text-[#6B7280]">
        <span className="w-8 h-8 border-2 border-[#800020] border-t-transparent rounded-full animate-spin mb-4" />
        {t("common.loading")}
      </div>
    );
  }

  // --- STATS CALCULATIONS ---
  const totalTickets = complaints.length;
  const newTickets = complaints.filter(c => c.status === "New").length;
  const activeTickets = complaints.filter(c => ["Assigned", "In Progress", "Pending Government Action"].includes(c.status)).length;
  const resolvedTickets = complaints.filter(c => ["Resolved", "Closed"].includes(c.status)).length;

  // Pie chart priority data
  const priorityBreakdown = [
    { name: "Low", value: complaints.filter(c => c.priority_level === "Low").length },
    { name: "Medium", value: complaints.filter(c => c.priority_level === "Medium").length },
    { name: "High", value: complaints.filter(c => c.priority_level === "High").length },
    { name: "Critical", value: complaints.filter(c => c.priority_level === "Critical").length }
  ].filter(p => p.value > 0);

  // Bar chart categories data
  const categoryChartData = CATEGORIES.map(c => {
    const name = language === "ta" ? c.name_ta : c.name_en;
    const value = complaints.filter(comp => comp.category_id === c.id).length;
    return { name, value };
  }).filter(c => c.value > 0);

  // Bar chart wards data
  const areaChartData = WARDS.map(w => {
    const name = language === "ta" ? w.name_ta.split(" - ")[1] : w.name_en.split(" - ")[1];
    const value = complaints.filter(comp => comp.ward_id === w.id).length;
    return { name, value };
  }).filter(w => w.value > 0);

  // Trends Line chart (Group by Month)
  const trendsData = [
    { month: "Jan", tickets: 0 },
    { month: "Feb", tickets: 0 },
    { month: "Mar", tickets: 0 },
    { month: "Apr", tickets: 0 },
    { month: "May", tickets: 2 },
    { month: "Jun", tickets: totalTickets }
  ];

  // Most Supported Issues
  const mostSupported = [...complaints]
    .sort((a, b) => b.support_count - a.support_count)
    .slice(0, 3);

  // Hotspots Analysis: Ward + Category matches
  // If count >= 2 in active statuses: High Priority Zone
  const zoneMap: Record<string, HotspotZone> = {};
  complaints.forEach(c => {
    if (!["New", "Assigned", "In Progress", "Pending Government Action"].includes(c.status)) return;
    const key = `${c.ward_id}-${c.category_id}`;
    if (!zoneMap[key]) {
      zoneMap[key] = {
        wardId: c.ward_id,
        wardName: c.wardName,
        wardNameTa: c.wardNameTa,
        categoryId: c.category_id,
        categoryName: c.categoryName,
        categoryNameTa: c.categoryNameTa,
        categoryIcon: c.categoryIcon,
        complaintCount: 0,
        totalScore: 0,
        level: "Low"
      };
    }
    zoneMap[key].complaintCount += 1;
    zoneMap[key].totalScore += c.priority_score;
  });

  const hotspotsList = Object.values(zoneMap)
    .map(z => {
      let level = "Low";
      if (z.complaintCount >= 5) level = "Critical";
      else if (z.complaintCount >= 3) level = "High";
      else if (z.complaintCount >= 1) level = "Medium";
      return { ...z, level };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 3);

  // Filter complaints list
  const filteredComplaints = complaints.filter(c => {
    const matchSearch = searchQuery.trim() === ""
      ? true
      : c.ticket_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = filterStatus ? c.status === filterStatus : true;
    const matchWard = filterWard ? c.ward_id === parseInt(filterWard) : true;

    return matchSearch && matchStatus && matchWard;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#F4F2EE] min-h-screen">
      {/* ── SIDEBAR NAV ── */}
      <aside className="w-full md:w-64 bg-[#142840] text-white flex flex-col border-r border-[#DDD9D0]">
        {/* Header logo */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#800020]/20 border border-[#D4920F] flex items-center justify-center text-md">
            🏛️
          </div>
          <div>
            <h2 className="font-serif font-bold text-sm tracking-wider uppercase"> தவெக Control Panel</h2>
            <p className="text-[9px] uppercase font-bold text-[#D4920F] tracking-widest">Madurai East</p>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-4 bg-white/5 border-b border-white/10 text-xs text-white/60 space-y-1">
          <div className="font-semibold text-white">Authenticated Session</div>
          <div>Role: Assembly Admin</div>
          <div>MLA Representative Representative</div>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#F5B01A] block">Digital Governance</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-950/40 hover:bg-[#800020] text-white border border-[#800020]/40 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto max-w-5xl">
        
        {/* HEADER BAR */}
        <div className="flex justify-between items-center border-b border-[#DDD9D0] pb-4 flex-wrap gap-2">
          <div>
            <h1 className="font-serif font-bold text-2xl text-[#1C3557]">{t("admin.statsTitle")}</h1>
            <p className="text-xs text-[#6B7280]">Constituency Grievance Monitoring & Analytics Dashboard</p>
          </div>
          <a
            href="/"
            className="px-4 py-1.5 border border-[#142840] text-[#142840] hover:bg-[#142840] hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            ← Public View
          </a>
        </div>

        {/* ── STATISTICS CARDS GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t("admin.totalComplaints"), count: totalTickets, color: "text-[#1C3557]", bg: "bg-[#1C3557]/5", icon: FileText },
            { label: t("admin.new"), count: newTickets, color: "text-blue-600", bg: "bg-blue-50", icon: Inbox },
            { label: "Active / Assigned", count: activeTickets, color: "text-amber-600", bg: "bg-amber-50", icon: Users },
            { label: t("admin.resolved"), count: resolvedTickets, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className={`p-4 border border-[#DDD9D0] rounded-xl flex items-center justify-between shadow-sm bg-white`}>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider leading-tight">{card.label}</div>
                  <div className={`text-2xl font-serif font-extrabold ${card.color}`}>{card.count}</div>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CHARTS CONTAINER ── */}
        <AnalyticsCharts
          categoryData={categoryChartData}
          areaData={areaChartData}
          priorityData={priorityBreakdown}
          trendData={trendsData}
        />

        {/* ── HOTSPOTS AND MOST SUPPORTED BOARD (Double Column) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column A: High Priority Zones */}
          <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-[#1C3557] font-serif text-md flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                {t("admin.hotspots")}
              </h3>
              <p className="text-[10px] text-[#6B7280]">{t("admin.hotspotsSub")}</p>
            </div>

            {hotspotsList.length > 0 ? (
              <div className="space-y-3">
                {hotspotsList.map((z, idx) => {
                  let badgeCol = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  if (z.level === "Critical") badgeCol = "bg-red-100 text-red-900 border-red-200";
                  else if (z.level === "High") badgeCol = "bg-red-50 text-red-800 border-red-200";
                  else if (z.level === "Medium") badgeCol = "bg-amber-50 text-amber-800 border-amber-200";

                  return (
                    <div key={idx} className="p-3 border border-[#DDD9D0] bg-[#FCFBF9] rounded-lg flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-xl">{z.categoryIcon}</span>
                        <div>
                          <div className="font-bold text-[#111827]">
                            {language === "ta" ? z.wardNameTa : z.wardName}
                          </div>
                          <div className="text-[10px] text-[#6B7280]">
                            {language === "ta" ? z.categoryNameTa : z.categoryName} • {z.complaintCount} Active Tickets
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${badgeCol}`}>
                        {z.level} Zone
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#6B7280] italic text-center py-4">No active complaint hot-spots detected.</p>
            )}
          </div>

          {/* Column B: Most Supported Issues */}
          <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-[#1C3557] font-serif text-md flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-[#D4920F]" />
                {t("admin.mostSupported")}
              </h3>
              <p className="text-[10px] text-[#6B7280]">Citizen upvote trends and public board rankings</p>
            </div>

            {mostSupported.length > 0 ? (
              <div className="space-y-3">
                {mostSupported.map((c, idx) => (
                  <div key={idx} className="p-3 border border-[#DDD9D0] bg-[#FCFBF9] rounded-lg flex items-center justify-between gap-2">
                    <div className="text-xs space-y-0.5 truncate flex-1">
                      <div className="font-bold text-[#111827] truncate">{c.title}</div>
                      <div className="text-[10px] text-[#6B7280] flex items-center gap-1.5">
                        <span className="font-mono text-[#800020] font-bold">{c.ticket_no}</span>
                        <span>•</span>
                        <span>{language === "ta" ? c.wardNameTa : c.wardName}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 bg-[#1C3557]/5 border border-[#1C3557]/10 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#1C3557] flex-shrink-0">
                      <ThumbsUp className="w-3 h-3 text-[#1C3557] fill-[#1C3557]" />
                      {c.support_count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6B7280] italic text-center py-4">No public upvote data registered yet.</p>
            )}
          </div>

        </div>

        {/* ── COMPLAINT TICKET EDITOR WORKSPACE (Full Screen width) ── */}
        <div className="bg-white border border-[#DDD9D0] rounded-xl shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-[#DDD9D0]">
            <h3 className="font-serif font-bold text-lg text-[#1C3557]">{t("admin.allTickets")}</h3>
            <p className="text-xs text-[#6B7280]">Review submitted grievances, assign field volunteers, update statuses, or upload resolutions</p>
          </div>

          {/* Ticket searching controls */}
          <div className="p-4 bg-gray-50/50 border-b border-[#DDD9D0] flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket number, citizen, title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-[#DDD9D0] bg-white rounded-lg text-xs outline-none focus:border-[#800020]"
              />
            </div>
            
            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 border border-[#DDD9D0] bg-white rounded-lg text-xs font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="">Status (All)</option>
              {["New", "Assigned", "In Progress", "Pending Government Action", "Resolved", "Closed"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Filter Ward */}
            <select
              value={filterWard}
              onChange={e => setFilterWard(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 border border-[#DDD9D0] bg-white rounded-lg text-xs font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="">Ward (All)</option>
              {WARDS.map(w => (
                <option key={w.id} value={w.id}>
                  {language === "ta" ? w.name_ta.split(" - ")[1] : w.name_en.split(" - ")[1]}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Complaints Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#DDD9D0] text-[#6B7280] font-bold uppercase tracking-wider">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Citizen</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Ward / Area</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD9D0]">
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#800020]">{c.ticket_no}</td>
                      <td className="p-4 font-semibold text-gray-800">
                        <div>{c.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{c.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1">
                          <span>{c.categoryIcon}</span>
                          <span>{language === "ta" ? c.categoryNameTa : c.categoryName}</span>
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {language === "ta" ? c.wardNameTa : c.wardName}
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          c.priority_level === "Critical" ? "bg-red-100 border-red-200 text-red-900" :
                          c.priority_level === "High" ? "bg-red-50 border-red-100 text-red-600" :
                          c.priority_level === "Medium" ? "bg-amber-50 border-amber-100 text-amber-600" :
                          "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}>
                          {t(`priority.${c.priority_level}`)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                          c.status === "Resolved" || c.status === "Closed" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                          c.status === "In Progress" ? "bg-sky-50 border-sky-200 text-sky-800" :
                          c.status === "Assigned" ? "bg-amber-50 border-amber-200 text-amber-800" :
                          c.status === "Pending Government Action" ? "bg-purple-50 border-purple-200 text-purple-800" :
                          "bg-slate-100 border-slate-200 text-slate-800"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleSelectComplaint(c)}
                          className="px-3 py-1 bg-[#142840] hover:bg-[#2A4A70] text-white font-bold rounded cursor-pointer transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 italic bg-gray-50/20">
                      No complaints matched the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── POPUP ACTION MODAL: MANAGE TICKET ── */}
        {selectedComp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-[#DDD9D0] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="p-4 bg-[#142840] text-white flex justify-between items-center">
                <div>
                  <h4 className="font-serif font-bold text-sm tracking-wider uppercase">Grievance Ticket Editor</h4>
                  <p className="text-[10px] text-[#F5B01A] font-bold tracking-widest">{selectedComp.ticket_no}</p>
                </div>
                <button
                  onClick={() => setSelectedComp(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer border-none"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveComplaintAction} className="p-5 overflow-y-auto space-y-4 flex-1">
                
                {/* Summary card info */}
                <div className="bg-gray-50 border border-[#DDD9D0] p-3 rounded-lg text-xs space-y-2">
                  <div><strong>Title:</strong> {selectedComp.title}</div>
                  <div><strong>Description:</strong> {selectedComp.description}</div>
                  <div>📍 <strong>Address:</strong> {selectedComp.address}</div>
                  {selectedComp.photo_url && (
                    <div className="mt-1">
                      <a href={selectedComp.photo_url} target="_blank" className="text-[#800020] hover:underline font-bold">
                        [View Uploaded Photo]
                      </a>
                    </div>
                  )}
                  {selectedComp.document_url && (
                    <div className="mt-1">
                      <a href={selectedComp.document_url} target="_blank" className="text-sky-700 hover:underline font-bold">
                        [View Supporting Document]
                      </a>
                    </div>
                  )}
                </div>

                {/* Status selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#111827]">
                    {t("admin.changeStatus")}
                  </label>
                  <select
                    value={actStatus}
                    onChange={e => setActStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDD9D0] bg-white rounded-lg text-xs font-semibold text-gray-700 outline-none cursor-pointer"
                  >
                    {["New", "Assigned", "In Progress", "Pending Government Action", "Resolved", "Closed"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Volunteer Assignment */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#111827]">
                    {t("admin.assignVolunteer")}
                  </label>
                  <select
                    value={actVolunteer}
                    onChange={e => setActVolunteer(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDD9D0] bg-white rounded-lg text-xs font-semibold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="">Not Assigned</option>
                    {volunteers.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {/* Action notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#111827]">
                    {t("admin.addNotes")}
                  </label>
                  <textarea
                    rows={2}
                    value={actNotes}
                    onChange={e => setActNotes(e.target.value)}
                    placeholder="Enter internal notes, instructions, or resolution logs..."
                    className="w-full px-3 py-2 border border-[#DDD9D0] rounded-lg text-xs bg-gray-50 focus:bg-white focus:border-[#800020] outline-none resize-none transition-all"
                  />
                </div>

                {/* RESOLUTION WALL RESOLVER EXTRA FIELDS */}
                {actStatus === "Resolved" && (
                  <div className="border-t border-dashed border-[#DDD9D0] pt-4 space-y-4 bg-emerald-50/20 p-3 rounded-lg border border-emerald-100">
                    <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Resolution Wall Publication
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      Uploading an AFTER photo and adding resolution descriptions will automatically post this ticket on the public Resolution Wall.
                    </p>

                    {/* After Photo Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">{t("admin.uploadAfterPhoto")}</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-emerald-300 rounded-lg p-3 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setResolutionPhoto(f);
                              handleResolutionPhotoUpload(f);
                            }
                          }}
                          className="hidden"
                        />
                        <Upload className="w-4 h-4 text-emerald-500 mb-1" />
                        <span className="text-[11px] font-bold text-emerald-950 truncate max-w-[200px]">
                          {resolutionPhoto ? resolutionPhoto.name : "Choose after-resolution photo"}
                        </span>
                        {resolutionPhotoUrl && <span className="text-[9px] text-emerald-600 font-semibold mt-1">Uploaded successfully ✓</span>}
                      </div>
                    </div>

                    {/* Resolution Details Tamil */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">தீர்வு விவரங்கள் (தமிழ்) *</label>
                      <textarea
                        rows={2}
                        value={resDetailsTa}
                        onChange={e => setResDetailsTa(e.target.value)}
                        placeholder="செல்லூர் வார்டில் குழாய் பழுது நீக்கப்பட்டு குடிநீர் வழங்கல் சீரமைக்கப்பட்டது."
                        className="w-full px-3 py-2 border border-[#DDD9D0] bg-white rounded-lg text-xs outline-none"
                      />
                    </div>

                    {/* Resolution Details English */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">Resolution Details (English) *</label>
                      <textarea
                        rows={2}
                        value={resDetailsEn}
                        onChange={e => setResDetailsEn(e.target.value)}
                        placeholder="Water pipe pipeline repaired and supply restored in Sellur."
                        className="w-full px-3 py-2 border border-[#DDD9D0] bg-white rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="pt-2 flex gap-2 border-t border-[#DDD9D0]">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2 bg-[#800020] hover:bg-[#A31D38] text-white font-bold rounded-lg text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {actionLoading ? t("common.loading") : t("admin.actionSave")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedComp(null)}
                    className="px-4 py-2 border border-[#DDD9D0] text-gray-600 hover:bg-gray-50 font-bold rounded-lg text-xs cursor-pointer active:scale-95"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS MANAGEMENT AREA ── */}
        <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1C3557] flex items-center gap-1.5">
              <Megaphone className="w-5 h-5 text-[#800020]" />
              {t("admin.announcements")}
            </h3>
            <p className="text-xs text-[#6B7280]">Add new notices to the scrolling marquee ticker on the homepage</p>
          </div>

          {annSuccess && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Announcement published successfully!</span>
            </div>
          )}

          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title Tamil */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111827]">{t("admin.announcementTitleTa")}</label>
                <input
                  type="text"
                  required
                  value={annTitleTa}
                  onChange={e => setAnnTitleTa(e.target.value)}
                  placeholder="அறிவிப்பின் சுருக்கமான தலைப்பு"
                  className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-xs bg-gray-50 focus:bg-white focus:border-[#800020] outline-none"
                />
              </div>

              {/* Title English */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#111827]">{t("admin.announcementTitleEn")}</label>
                <input
                  type="text"
                  required
                  value={annTitleEn}
                  onChange={e => setAnnTitleEn(e.target.value)}
                  placeholder="Short summary of announcement"
                  className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-xs bg-gray-50 focus:bg-white focus:border-[#800020] outline-none"
                />
              </div>

              {/* Content Tamil */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#111827]">{t("admin.announcementContentTa")}</label>
                <textarea
                  rows={2}
                  required
                  value={annContentTa}
                  onChange={e => setAnnContentTa(e.target.value)}
                  placeholder="அறிவிப்பின் முழு விவரங்கள்"
                  className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-xs bg-gray-50 focus:bg-white focus:border-[#800020] outline-none resize-none"
                />
              </div>

              {/* Content English */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#111827]">{t("admin.announcementContentEn")}</label>
                <textarea
                  rows={2}
                  required
                  value={annContentEn}
                  onChange={e => setAnnContentEn(e.target.value)}
                  placeholder="Full announcement description in English"
                  className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-xs bg-gray-50 focus:bg-white focus:border-[#800020] outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={annSubmitting}
              className="py-2 px-5 bg-[#800020] hover:bg-[#A31D38] text-white font-bold rounded-lg text-xs shadow flex items-center gap-1 cursor-pointer active:scale-95 transition-all disabled:opacity-70"
            >
              <Plus className="w-4 h-4" />
              {annSubmitting ? t("common.loading") : t("admin.addBtn")}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
