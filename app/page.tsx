"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { 
  Building2, 
  MapPin, 
  FileText, 
  Map as MapIcon, 
  CheckCircle2, 
  Search, 
  ChevronRight, 
  Upload, 
  Check, 
  Globe, 
  AlertCircle, 
  ThumbsUp, 
  Navigation,
  FileCheck,
  Megaphone,
  User,
  ShieldCheck
} from "lucide-react";
import dynamic from "next/dynamic";
import ComplaintCard from "@/components/ComplaintCard";

// Dynamically load MapView client-side to prevent SSR window reference errors
const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-sm text-slate-500 animate-pulse">
      Loading interactive map...
    </div>
  )
});

interface Announcement {
  id: number;
  title_ta: string;
  title_en: string;
  content_ta: string;
  content_en: string;
  created_at: string;
}

interface Complaint {
  id: number;
  ticket_no: string;
  name: string;
  phone: string;
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
  created_at: string;
  wardName: string;
  wardNameTa: string;
  categoryName: string;
  categoryNameTa: string;
  categoryIcon: string;
  support_count: number;
  admin_notes?: string;
  volunteer_id?: number | null;
}

interface Resolution {
  id: number;
  complaint_id: number;
  before_photo_url: string;
  after_photo_url: string;
  resolution_details_ta: string;
  resolution_details_en: string;
  completed_at: string;
  ticket_no: string;
  title: string;
  wardName: string;
  wardNameTa: string;
  categoryName: string;
  categoryNameTa: string;
  categoryIcon: string;
}

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<"form" | "board" | "map" | "wall" | "track">("form");
  
  // Data States
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [supportedTickets, setSupportedTickets] = useState<number[]>([]);

  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [wardId, setWardId] = useState("");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  
  // Upload URLs
  const [photoUrl, setPhotoUrl] = useState("");
  const [docUrl, setDocUrl] = useState("");
  
  // GPS pick
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingGps, setGettingGps] = useState(false);

  // Form Process States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<any>(null);

  // Search Ticket States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedComplaint, setSearchedComplaint] = useState<Complaint | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Filters for Board/Map
  const [filterWard, setFilterWard] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Static Wards Definition
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

  // Static Categories Definition
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
    fetchData();
    // Load local supported tickets
    const supported = localStorage.getItem("tvk_supported_tickets");
    if (supported) {
      setSupportedTickets(JSON.parse(supported));
    }
  }, []);

  const fetchData = async () => {
    try {
      // Fetch announcements
      const resAnn = await fetch("/api/announcements");
      const dataAnn = await resAnn.json();
      setAnnouncements(dataAnn);

      // Fetch complaints
      const resComp = await fetch("/api/complaints");
      const dataComp = await resComp.json();
      setComplaints(dataComp);

      // Fetch resolutions
      const resRes = await fetch("/api/resolutions");
      const dataRes = await resRes.json();
      setResolutions(dataRes);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    }
  };

  const handleSupport = async (id: number) => {
    if (supportedTickets.includes(id)) return;

    try {
      const res = await fetch("/api/supports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_id: id }),
      });

      if (res.ok) {
        const updated = [...supportedTickets, id];
        setSupportedTickets(updated);
        localStorage.setItem("tvk_supported_tickets", JSON.stringify(updated));
        
        // Refresh local complaint count in state
        setComplaints(prev => prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              support_count: c.support_count + 1,
              priority_score: c.priority_score + 2
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error("Error upvoting issue:", error);
    }
  };

  const getGpsLocation = () => {
    setGettingGps(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setGettingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingGps(false);
      },
      (error) => {
        console.error("GPS error:", error);
        // Fallback to approximate R.K. Nagar center
        setGpsLocation({ lat: 13.1186, lng: 80.2796 });
        setGettingGps(false);
      }
    );
  };

  const handleFileUpload = async (file: File, type: "photo" | "doc") => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        if (type === "photo") setPhotoUrl(data.url);
        else setDocUrl(data.url);
      } else {
        console.error("Upload failed:", data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = t("error.name");
    if (!/^[6-9]\d{9}$/.test(phone)) tempErrors.phone = t("error.phone");
    if (!gender) tempErrors.gender = t("error.gender");
    if (!wardId) tempErrors.ward = t("error.ward");
    if (!address.trim()) tempErrors.address = t("error.address");
    if (!categoryId) tempErrors.category = t("error.category");
    if (!title.trim()) tempErrors.title = t("error.title");
    if (description.trim().length < 20) tempErrors.desc = t("error.desc");

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // 1. Submit complaint details
      const payload = {
        name,
        phone,
        email,
        address,
        ward_id: parseInt(wardId),
        category_id: parseInt(categoryId),
        title,
        description,
        photo_url: photoUrl,
        document_url: docUrl,
        latitude: gpsLocation?.lat,
        longitude: gpsLocation?.lng
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedTicket(data);
        setSubmitSuccess(true);
        // Reset inputs
        setName("");
        setPhone("");
        setEmail("");
        setGender("");
        setWardId("");
        setAddress("");
        setCategoryId("");
        setTitle("");
        setDescription("");
        setPhoto(null);
        setDocument(null);
        setPhotoUrl("");
        setDocUrl("");
        setGpsLocation(null);
        fetchData(); // reload complaints list
      } else {
        alert("Submission Failed: " + data.error);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = complaints.find(
      c => c.ticket_no.toLowerCase().trim() === searchQuery.toLowerCase().trim()
    );

    setSearchedComplaint(matched || null);
    setSearchAttempted(true);
  };

  // Filters for board & map
  const filteredComplaints = complaints.filter(c => {
    const matchWard = filterWard ? c.ward_id === parseInt(filterWard) : true;
    const matchCat = filterCategory ? c.category_id === parseInt(filterCategory) : true;
    return matchWard && matchCat;
  });

  // Map markers mapping
  const mapItems = filteredComplaints.map(c => ({
    id: c.id,
    ticket_no: c.ticket_no,
    title: c.title,
    wardName: language === "ta" ? c.wardNameTa : c.wardName,
    categoryName: language === "ta" ? c.categoryNameTa : c.categoryName,
    priority_level: c.priority_level,
    status: c.status,
    latitude: c.latitude || 0,
    longitude: c.longitude || 0
  })).filter(c => c.latitude !== 0);

  return (
    <div className="flex-1 flex flex-col">
      {/* ── BILINGUAL LANGUAGE SWITCHER & ADMIN LOGIN ROW ── */}
      <div className="bg-[#142840] text-white/85 text-xs px-4 py-1.5 flex justify-between items-center border-b border-white/10">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4920F]" />
          <a href="/admin/login" className="hover:underline hover:text-[#F5B01A] font-semibold transition-colors">
            {t("nav.admin")}
          </a>
        </span>
        <button
          onClick={() => setLanguage(language === "ta" ? "en" : "ta")}
          className="flex items-center gap-1 hover:text-white font-bold bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === "ta" ? "English" : "தமிழ் (Tamil)"}</span>
        </button>
      </div>

      {/* ── WEBSITE HEADER ── */}
      <header className="bg-gradient-to-r from-[#4D0010] to-[#800020] text-white border-b-4 border-[#D4920F] relative">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          {/* MLA Profile Photo Emblem placeholder */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 border-2 border-[#D4920F] flex items-center justify-center text-4xl shadow-md select-none">
            🏛️
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#F5B01A] block">
              {t("mla.partyTag")}
            </span>
            <h1 className="text-2xl md:text-3.5xl font-bold font-serif leading-tight">
              {t("mla.name")}
            </h1>
            <p className="text-xs md:text-sm text-white/70">
              {t("mla.sub")}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 border border-white/10 rounded-full text-xs font-semibold text-[#F5B01A]">
                {t("mla.badge")}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── QUOTE BAR ── */}
      <div className="bg-[#FCFBF9] border-b border-[#DDD9D0] py-3 px-4 text-center">
        <p className="text-xs md:text-sm italic font-medium text-[#6B7280] max-w-xl mx-auto leading-relaxed">
          {t("mla.quote")}
        </p>
      </div>

      {/* ── ANNOUNCEMENTS BANNER ── */}
      <div className="bg-[#F5B01A] text-[#142840] font-semibold text-xs md:text-sm py-2 px-4 flex items-center gap-3 overflow-hidden shadow-inner border-b border-[#D4920F]">
        <span className="flex items-center gap-1 bg-[#142840] text-[#F5B01A] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold flex-shrink-0">
          <Megaphone className="w-3.5 h-3.5" />
          {t("announcements.label")}
        </span>
        <div className="flex-1 overflow-hidden relative h-5">
          <div className="absolute whitespace-nowrap animate-marquee">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <span key={ann.id} className="mr-12">
                  • {language === "ta" ? ann.content_ta : ann.content_en}
                </span>
              ))
            ) : (
              <span>• {t("announcements.fallback")}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── DYNAMIC PAGE TABS (Mobile First) ── */}
      <div className="bg-white border-b border-[#DDD9D0] sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: "form", label: t("nav.submit"), icon: FileText },
            { id: "board", label: t("nav.board"), icon: Building2 },
            { id: "map", label: t("nav.home") + " " + t("nav.board") + " Map", icon: MapIcon },
            { id: "wall", label: t("nav.wall"), icon: CheckCircle2 },
            { id: "track", label: t("nav.track"), icon: Search }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSubmitSuccess(false);
                }}
                className={`flex-1 min-w-[110px] py-3.5 px-2 flex flex-col items-center gap-1 text-center border-b-2 font-bold text-xs uppercase tracking-wide cursor-pointer transition-all ${
                  active 
                    ? "border-[#800020] text-[#800020] bg-red-50/20" 
                    : "border-transparent text-[#6B7280] hover:text-[#111827] hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#800020]" : "text-[#6B7280]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN PORTAL BODY ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        
        {/* ── 1. COMPLAINT FORM TAB ── */}
        {activeTab === "form" && (
          <div className="space-y-6">
            {submitSuccess && generatedTicket ? (
              /* Success screen after submission */
              <div className="bg-white border border-[#DDD9D0] rounded-xl p-6 md:p-10 shadow-sm text-center max-w-lg mx-auto animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-3xl text-emerald-600 mx-auto mb-6 shadow-sm">
                  ✓
                </div>
                
                <h3 className="font-serif font-bold text-2xl text-[#1C3557] mb-2">
                  {t("success.title")}
                </h3>
                <p className="text-xs text-[#6B7280] mb-6">
                  {t("success.sub")}
                </p>

                <div className="bg-[#F4F2EE] border border-[#DDD9D0] rounded-xl p-4 mb-8">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280] mb-1">
                    {t("success.ticketId")}
                  </div>
                  <div className="font-serif font-bold text-2xl text-[#800020] tracking-widest">
                    {generatedTicket.ticket_no}
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex justify-between items-center max-w-xs mx-auto mb-8 text-[10px] font-bold text-[#6B7280]">
                  <div className="flex flex-col items-center flex-1 relative">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-bold text-xs z-10">
                      📨
                    </div>
                    <span className="mt-2 text-emerald-800">{t("success.timeline.received")}</span>
                    <div className="absolute top-3.5 left-[50%] right-[-50%] h-[2px] bg-[#DDD9D0] z-0" />
                  </div>
                  <div className="flex flex-col items-center flex-1 relative">
                    <div className="w-7 h-7 rounded-full bg-[#F4F2EE] border-2 border-[#DDD9D0] text-[#6B7280] flex items-center justify-center font-bold text-xs z-10">
                      🔍
                    </div>
                    <span className="mt-2">{t("success.timeline.review")}</span>
                    <div className="absolute top-3.5 left-[50%] right-[-50%] h-[2px] bg-[#DDD9D0] z-0" />
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-7 h-7 rounded-full bg-[#F4F2EE] border-2 border-[#DDD9D0] text-[#6B7280] flex items-center justify-center font-bold text-xs z-10">
                      ⚙️
                    </div>
                    <span className="mt-2">{t("success.timeline.progress")}</span>
                  </div>
                </div>

                <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm mx-auto mb-8 border-t border-[#DDD9D0] pt-6">
                  {t("success.note")}
                </p>

                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-6 py-2.5 bg-[#800020] hover:bg-[#A31D38] text-white font-bold rounded-lg text-sm shadow-md transition-all cursor-pointer active:scale-95"
                >
                  {t("success.another")}
                </button>
              </div>
            ) : (
              /* Complaint Form Input fields */
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <h2 className="text-[#1C3557] font-bold text-xl font-serif">{t("form.title")}</h2>
                  <p className="text-xs text-[#6B7280]">{t("form.sub")}</p>
                </div>

                {/* Section A: Personal Information */}
                <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-[#D4920F] border-b border-[#DDD9D0] pb-2 mb-3">
                    {t("form.personalInfo")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#111827]">
                        {t("form.name")} <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={t("form.namePlaceholder")}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#800020] outline-none transition-all"
                      />
                      {errors.name && <span className="text-[10px] text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.name}</span>}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#111827]">
                        {t("form.phone")} <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder={t("form.phonePlaceholder")}
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#800020] outline-none transition-all"
                      />
                      {errors.phone && <span className="text-[10px] text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.phone}</span>}
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-[#111827]">
                        {t("form.gender")} <span className="text-red-600">*</span>
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {["Male", "Female", "Other"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`px-4 py-2 border text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              gender === g
                                ? "bg-[#800020]/10 border-[#800020] text-[#800020]"
                                : "bg-gray-50 border-[#DDD9D0] text-[#6B7280] hover:bg-slate-100"
                            }`}
                          >
                            {t(`form.gender.${g.toLowerCase()}`)}
                          </button>
                        ))}
                      </div>
                      {errors.gender && <span className="text-[10px] text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.gender}</span>}
                    </div>

                    {/* Ward */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#111827]">
                        {t("form.ward")} <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={wardId}
                        onChange={e => setWardId(e.target.value)}
                        className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-sm bg-gray-50 focus:border-[#800020] outline-none cursor-pointer transition-all"
                      >
                        <option value="">{t("form.selectWard")}</option>
                        {WARDS.map((w) => (
                          <option key={w.id} value={w.id}>
                            {language === "ta" ? w.name_ta : w.name_en}
                          </option>
                        ))}
                      </select>
                      {errors.ward && <span className="text-[10px] text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.ward}</span>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#111827]">
                        {t("form.email")} <span className="text-xs text-[#6B7280] font-normal">{t("form.emailOpt")}</span>
                      </label>
                      <input
                        type="email"
                        placeholder={t("form.emailPlaceholder")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#800020] outline-none transition-all"
                      />
                    </div>

                    {/* Address */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-[#111827]">
                        {t("form.address")} <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder={t("form.addressPlaceholder")}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#800020] outline-none resize-none transition-all"
                      />
                      {errors.address && <span className="text-[10px] text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.address}</span>}
                    </div>
                  </div>
                </div>

                {/* Section B: Complaint Information */}
                <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-[#D4920F] border-b border-[#DDD9D0] pb-2 mb-3">
                    {t("form.complaintDetails")}
                  </h3>

                  <div className="space-y-4">
                    {/* Category Selection Grid */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#111827]">
                        {t("form.category")} <span className="text-red-600">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCategoryId(String(c.id))}
                            className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                              categoryId === String(c.id)
                                ? "bg-[#800020]/10 border-[#800020] text-[#800020] font-bold"
                                : "bg-gray-50 border-[#DDD9D0] text-[#6B7280] hover:bg-slate-100"
                            }`}
                          >
                            <span className="text-2xl">{c.icon}</span>
                            <span className="text-[10px] leading-tight select-none">
                              {language === "ta" ? c.name_ta : c.name_en}
                            </span>
                          </button>
                        ))}
                      </div>
                      {errors.category && <span className="text-[10px] text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.category}</span>}
                    </div>

                    {/* Complaint Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#111827]">
                        Grievance Title / புகாரின் தலைப்பு <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Short summary of problem / பிரச்சனையின் சுருக்கம்"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#800020] outline-none transition-all"
                      />
                      {errors.title && <span className="text-[10px] text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.title}</span>}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#111827]">
                        {t("form.desc")} <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder={t("form.descPlaceholder")}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#800020] outline-none transition-all"
                      />
                      <div className="flex justify-between items-center text-[10px] font-semibold mt-0.5">
                        <span className={description.trim().length < 20 ? "text-red-600" : "text-emerald-600"}>
                          {description.trim().length} / 20 {t("form.charNeeded")}
                        </span>
                        {description.trim().length >= 20 && <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> {t("form.charOk")}</span>}
                      </div>
                      {errors.desc && <span className="text-[10px] text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.desc}</span>}
                    </div>

                    {/* Files Upload Grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Photo Upload */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#111827]">{t("form.uploadPhoto")}</label>
                        <div 
                          onClick={() => photoInputRef.current?.click()}
                          className="border-2 border-dashed border-[#DDD9D0] rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-100 hover:border-[#800020] transition-colors text-center"
                        >
                          <input 
                            type="file" 
                            ref={photoInputRef}
                            accept="image/*"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setPhoto(f);
                                await handleFileUpload(f, "photo");
                              }
                            }}
                            className="hidden"
                          />
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-xs font-bold text-gray-700 truncate max-w-[200px]">
                            {photo ? photo.name : t("form.uploadClick")}
                          </span>
                          <span className="text-[10px] text-gray-400">{t("form.uploadHint")}</span>
                          {photoUrl && <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 mt-1 animate-bounce"><Check className="w-3 h-3" /> Uploaded</span>}
                        </div>
                      </div>

                      {/* Document Upload */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#111827]">{t("form.uploadDoc")}</label>
                        <div 
                          onClick={() => docInputRef.current?.click()}
                          className="border-2 border-dashed border-[#DDD9D0] rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-100 hover:border-[#800020] transition-colors text-center"
                        >
                          <input 
                            type="file" 
                            ref={docInputRef}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setDocument(f);
                                await handleFileUpload(f, "doc");
                              }
                            }}
                            className="hidden"
                          />
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-xs font-bold text-gray-700 truncate max-w-[200px]">
                            {document ? document.name : t("form.uploadClick")}
                          </span>
                          <span className="text-[10px] text-gray-400">{t("form.uploadHint")}</span>
                          {docUrl && <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 mt-1"><Check className="w-3 h-3" /> Uploaded</span>}
                        </div>
                      </div>
                    </div>

                    {/* GPS Coordinates Pick */}
                    <div className="bg-gray-50 border border-[#DDD9D0] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <Navigation className="w-4 h-4 text-[#800020]" />
                          {t("form.gps")}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {gpsLocation 
                            ? `${t("form.gpsSuccess")}: Lat ${gpsLocation.lat.toFixed(5)}, Lng ${gpsLocation.lng.toFixed(5)}`
                            : t("form.gpsHint")
                          }
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={getGpsLocation}
                        disabled={gettingGps}
                        className="w-full sm:w-auto px-4 py-2 border border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white font-bold text-xs rounded-lg cursor-pointer transition-colors active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {gettingGps ? t("common.loading") : t("form.gpsBtn")}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit button wrapper */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#800020] hover:bg-[#A31D38] text-white font-bold rounded-lg text-sm shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                        {t("form.submitting")}
                      </>
                    ) : (
                      <>
                        {t("form.submitBtn")}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-3 leading-relaxed">
                    {t("form.submitNote")}
                  </p>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── 2. COMMUNITY PUBLIC ISSUES BOARD ── */}
        {activeTab === "board" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-[#1C3557] font-bold text-xl font-serif">{t("board.title")}</h2>
                <p className="text-xs text-[#6B7280]">{t("board.sub")}</p>
              </div>

              {/* Filters UI */}
              <div className="flex gap-2 flex-wrap">
                {/* Ward filter */}
                <select
                  value={filterWard}
                  onChange={e => setFilterWard(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DDD9D0] bg-white rounded-lg text-xs font-semibold text-[#111827] outline-none cursor-pointer"
                >
                  <option value="">{t("form.ward")} (All)</option>
                  {WARDS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {language === "ta" ? w.name_ta.split(" - ")[1] : w.name_en.split(" - ")[1]}
                    </option>
                  ))}
                </select>

                {/* Category filter */}
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DDD9D0] bg-white rounded-lg text-xs font-semibold text-[#111827] outline-none cursor-pointer"
                >
                  <option value="">{t("form.category")} (All)</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === "ta" ? c.name_ta : c.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Complaint Cards Grid */}
            {filteredComplaints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredComplaints.map((item) => (
                  <ComplaintCard
                    key={item.id}
                    complaint={item}
                    hasSupported={supportedTickets.includes(item.id)}
                    onSupport={handleSupport}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#DDD9D0] rounded-xl p-12 text-center text-sm text-[#6B7280] shadow-sm">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                {t("board.noIssues")}
              </div>
            )}
          </div>
        )}

        {/* ── 3. MAP VIEW TAB ── */}
        {activeTab === "map" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[#1C3557] font-bold text-xl font-serif">Constituency Hotspots Map</h2>
              <p className="text-xs text-[#6B7280]">
                Interactive OpenStreetMap displaying local public complaints. Colors show urgency (Red/Maroon indicates High/Critical hotspots).
              </p>
            </div>

            <div className="h-[450px] w-full rounded-xl overflow-hidden shadow-sm relative border border-[#DDD9D0]">
              <MapView items={mapItems} />
              
              {/* Floating Legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-[#DDD9D0] p-3 rounded-lg text-[10px] space-y-1.5 shadow-md z-30 select-none">
                <div className="font-bold text-[#1C3557] border-b pb-1 mb-1.5 uppercase tracking-wide">Priority Legend</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7F1D1D] inline-block" /> <span className="font-semibold">{t("priority.Critical")}</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" /> <span className="font-semibold">{t("priority.High")}</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" /> <span className="font-semibold">{t("priority.Medium")}</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" /> <span className="font-semibold">{t("priority.Low")}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. RESOLUTION WALL TAB ── */}
        {activeTab === "wall" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[#1C3557] font-bold text-xl font-serif">{t("wall.title")}</h2>
              <p className="text-xs text-[#6B7280]">{t("wall.sub")}</p>
            </div>

            {resolutions.length > 0 ? (
              <div className="space-y-6">
                {resolutions.map((res) => {
                  const compDate = new Date(res.completed_at).toLocaleDateString(
                    language === "ta" ? "ta-IN" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  );

                  return (
                    <div key={res.id} className="bg-white border border-[#DDD9D0] rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
                      {/* Before / After comparison slider or side-by-side grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Before image */}
                        <div className="relative rounded-lg overflow-hidden h-64 border border-[#DDD9D0] bg-gray-50 flex flex-col justify-end">
                          <img src={res.before_photo_url} alt="Before work" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-[#800020] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm z-10">
                            {t("wall.before")}
                          </div>
                        </div>

                        {/* After image */}
                        <div className="relative rounded-lg overflow-hidden h-64 border border-[#DDD9D0] bg-gray-50 flex flex-col justify-end">
                          <img src={res.after_photo_url} alt="After resolution" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm z-10">
                            {t("wall.after")}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b pb-2">
                          <h3 className="font-bold text-[#1C3557] text-md flex items-center gap-1.5">
                            <span className="text-xl">{res.categoryIcon}</span>
                            {res.title}
                          </h3>
                          <span className="text-xs text-[#6B7280] font-semibold bg-[#F4F2EE] border px-2 py-0.5 rounded-full self-start">
                            {res.ticket_no}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-[#6B7280]">
                          <div>📍 <strong>{t("board.area")}:</strong> {language === "ta" ? res.wardNameTa : res.wardName}</div>
                          <div>📅 <strong>{t("wall.completed")}:</strong> {compDate}</div>
                        </div>

                        <div className="pt-2 text-sm text-[#111827] leading-relaxed">
                          <strong>{t("wall.details")}:</strong> {language === "ta" ? res.resolution_details_ta : res.resolution_details_en}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#DDD9D0] rounded-xl p-12 text-center text-sm text-[#6B7280] shadow-sm">
                <FileCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                {t("wall.noResolutions")}
              </div>
            )}
          </div>
        )}

        {/* ── 5. TRACK TICKET TAB ── */}
        {activeTab === "track" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[#1C3557] font-bold text-xl font-serif">{t("track.title")}</h2>
              <p className="text-xs text-[#6B7280]">{t("track.sub")}</p>
            </div>

            <form onSubmit={handleSearchTicket} className="flex gap-2">
              <input
                type="text"
                placeholder={t("track.placeholder")}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-[#DDD9D0] bg-white rounded-lg text-sm outline-none focus:border-[#800020]"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#800020] hover:bg-[#A31D38] text-white font-bold rounded-lg text-sm shadow transition-colors cursor-pointer active:scale-95"
              >
                {t("track.search")}
              </button>
            </form>

            {searchAttempted && !searchedComplaint && (
              <div className="bg-red-50 text-[#B91C1C] border border-red-200 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{t("track.notFound")}</span>
              </div>
            )}

            {searchedComplaint && (
              <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm space-y-6 animate-fade-in">
                {/* Header info */}
                <div className="border-b border-[#DDD9D0] pb-4 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-[#1C3557] font-serif text-lg">
                      {searchedComplaint.title}
                    </h3>
                    <div className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5">
                      <span className="text-sm">{searchedComplaint.categoryIcon}</span>
                      <span>{language === "ta" ? searchedComplaint.categoryNameTa : searchedComplaint.categoryName}</span>
                      <span>•</span>
                      <span>📍 {language === "ta" ? searchedComplaint.wardNameTa : searchedComplaint.wardName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#800020] bg-red-50 border border-red-200 px-3 py-1 rounded-full tracking-widest block font-mono">
                      {searchedComplaint.ticket_no}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#D4920F]">
                    {t("track.current")}
                  </h4>
                  
                  {/* Status Steps mapping */}
                  <div className="relative border-l-2 border-[#DDD9D0] pl-6 ml-3 space-y-6">
                    {[
                      { status: "New", icon: "📨", text: t("success.timeline.received"), active: true },
                      { 
                        status: "Assigned", 
                        icon: "👤", 
                        text: t("track.assignedTo"), 
                        active: ["Assigned", "In Progress", "Pending Government Action", "Resolved", "Closed"].includes(searchedComplaint.status),
                        detail: searchedComplaint.volunteer_id 
                          ? `${t("track.assignedTo")}: Active Volunteer (தொகுதி தன்னார்வலர்)`
                          : null
                      },
                      { 
                        status: "In Progress", 
                        icon: "⚙️", 
                        text: t("success.timeline.progress"), 
                        active: ["In Progress", "Pending Government Action", "Resolved", "Closed"].includes(searchedComplaint.status) 
                      },
                      { 
                        status: "Pending Government Action", 
                        icon: "🏛️", 
                        text: "Pending Government Action / அரசு பரிசீலனையில்", 
                        active: ["Pending Government Action", "Resolved", "Closed"].includes(searchedComplaint.status) 
                      },
                      { 
                        status: "Resolved", 
                        icon: "✅", 
                        text: t("success.timeline.resolved"), 
                        active: ["Resolved", "Closed"].includes(searchedComplaint.status) 
                      }
                    ].map((step, idx) => {
                      const isCurrent = searchedComplaint.status === step.status || 
                        (searchedComplaint.status === "Closed" && step.status === "Resolved");
                      
                      return (
                        <div key={idx} className="relative">
                          {/* Dot indicator */}
                          <div className={`absolute left-[-31px] w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 z-10 ${
                            isCurrent
                              ? "bg-[#800020] border-[#800020] text-white shadow-sm scale-110"
                              : step.active
                                ? "bg-emerald-50 border-emerald-500 text-emerald-600"
                                : "bg-white border-[#DDD9D0] text-[#6B7280]"
                          }`}>
                            {step.icon}
                          </div>
                          
                          {/* Label info */}
                          <div className="space-y-1">
                            <div className={`text-xs font-bold ${isCurrent ? "text-[#800020] text-sm" : step.active ? "text-[#1C3557]" : "text-gray-400"}`}>
                              {step.text}
                            </div>
                            {step.detail && step.active && (
                              <p className="text-[10px] text-gray-500 font-medium">
                                {step.detail}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info and Description */}
                <div className="border-t border-[#DDD9D0] pt-4 space-y-3">
                  <div className="text-xs text-slate-500 leading-relaxed bg-[#F4F2EE] p-3 rounded-lg">
                    <div className="font-bold text-[#1C3557] mb-1">{t("form.desc")}</div>
                    <p>{searchedComplaint.description}</p>
                  </div>
                  
                  {searchedComplaint.admin_notes && (
                    <div className="text-xs text-amber-900 leading-relaxed bg-amber-50 border border-amber-200 p-3 rounded-lg">
                      <div className="font-bold text-[#D4920F] mb-1">{t("track.adminNotes")}</div>
                      <p>{searchedComplaint.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── WEBSITE FOOTER ── */}
      <footer className="bg-[#142840] text-white/50 border-t border-white/10 py-6 px-4 text-center mt-auto select-none">
        <div className="max-w-4xl mx-auto space-y-2 text-xs md:text-sm">
          <p>{t("app.footer")}</p>
          <p className="text-[10px] text-white/35">
            {t("app.confidential")} • TVK R.K. Nagar Digital Grievance Portal 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
