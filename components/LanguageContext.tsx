"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "ta" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Complete bilingual dictionaries for Tamil and English
const dictionary: Record<Language, Record<string, string>> = {
  ta: {
    // Common
    "app.title": "தமிழக வெற்றிக் கழகம் | தொகுதி குறைதீர்ப்பு போர்டல்",
    "app.footer": "© 2026 தவெக மதுரை கிழக்கு சட்டமன்றத் தொகுதி அலுவலகம் • டிஜிட்டல் ஆளுகை முன்முயற்சி",
    "app.confidential": "அனைத்து புகார்களும் ரகசியமாக வைக்கப்படும்",
    "common.loading": "ஏற்றப்படுகிறது...",
    "common.submit": "சமர்ப்பி",
    "common.back": "பின்னால்",
    "common.save": "சேமி",
    "common.cancel": "ரத்து செய்",

    // Navigation
    "nav.home": "முகப்பு",
    "nav.submit": "புகார் அளிக்கவும்",
    "nav.track": "புகாரைக் கண்காணிக்க",
    "nav.board": "பொதுப் பிரச்சனைகள்",
    "nav.wall": "தீர்வுச் சுவர்",
    "nav.admin": "அதிகாரப்பூர்வ உள்நுழைவு",
    "nav.logout": "வெளியேறு",

    // MLA Profile
    "mla.partyTag": "தமிழக வெற்றிக் கழகம் • மதுரை கிழக்கு",
    "mla.name": "எஸ். கார்த்திகேயன்",
    "mla.sub": "MA, LLB — சட்டமன்ற உறுப்பினர், மதுரை கிழக்குத் தொகுதி",
    "mla.badge": "📍 மதுரை கிழக்குத் தொகுதி",
    "mla.quote": "\"மக்களின் குறைகளைத் தீர்ப்பதே எனது முதல் கடமை. நான் எப்போதும் உங்கள் தேவைகளுக்காக நிற்பேன்.\"",

    // Announcements
    "announcements.label": "அறிவிப்புகள்",
    "announcements.fallback": "தவெக மதுரை கிழக்கு தொகுதி குறைதீர்ப்பு வலைத்தளத்திற்கு வரவேற்கிறோம்! உங்கள் புகார்களை இங்கே பதிவு செய்யலாம்.",

    // Form
    "form.title": "உங்கள் புகாரை சமர்ப்பிக்கவும்",
    "form.sub": "கீழே உள்ள விவரங்களை நிரப்பவும் - * குறியிடப்பட்ட அனைத்து புலங்களும் கட்டாயமானவை.",
    "form.personalInfo": "தனிப்பட்ட தகவல்",
    "form.name": "முழு பெயர்",
    "form.namePlaceholder": "உங்கள் முழு பெயரை உள்ளிடவும்",
    "form.phone": "அலைபேசி எண்",
    "form.phonePlaceholder": "10-இலக்க அலைபேசி எண்",
    "form.gender": "பாலினம்",
    "form.gender.male": "♂ ஆண்",
    "form.gender.female": "♀ பெண்",
    "form.gender.other": "⊕ இதர",
    "form.ward": "வார்டு / பகுதி",
    "form.selectWard": "உங்கள் வார்டைத் தேர்ந்தெடுக்கவும்",
    "form.email": "மின்னஞ்சல் முகவரி",
    "form.emailPlaceholder": "your@email.com",
    "form.emailOpt": "(விருப்பத்திற்குரியது)",
    "form.address": "வீட்டு முகவரி",
    "form.addressPlaceholder": "கதவு எண், தெரு பெயர், பகுதி — மதுரை கிழக்கு",
    
    "form.complaintDetails": "புகார் விவரங்கள்",
    "form.category": "புகார் வகை",
    "form.desc": "புகாரின் விளக்கம்",
    "form.descPlaceholder": "பிரச்சனையை தெளிவாக விவரிக்கவும் - இடம், பிரச்சனை எவ்வளவு காலமாக உள்ளது, மற்றும் எடுக்கப்பட்ட நடவடிக்கைகள் ஏதேனும் இருந்தால் குறிப்பிடவும்.",
    "form.charNeeded": "எழுத்துக்கள் தேவை",
    "form.charOk": "சரி",
    
    "form.uploadPhoto": "புகைப்படம் பதிவேற்றவும்",
    "form.uploadDoc": "ஆவணம் பதிவேற்றவும் (விருப்பத்திற்குரியது)",
    "form.uploadHint": "JPG, PNG, PDF கோப்புகள் • அதிகபட்சம் 5 MB",
    "form.uploadClick": "கோப்பை இணைக்க கிளிக் செய்யவும்",
    "form.gps": "ஜிபிஎஸ் இருப்பிடம்",
    "form.gpsBtn": "தற்போதைய இருப்பிடத்தைப் பெறுக",
    "form.gpsSuccess": "இருப்பிடம் பெறப்பட்டது",
    "form.gpsHint": "இருப்பிட ஒருங்கிணைப்புகள் (விருப்பத்திற்குரியது)",

    "form.submitBtn": "புகாரை பதிவு செய்",
    "form.submitting": "பதிவு செய்யப்படுகிறது...",
    "form.submitNote": "இதைச் சமர்ப்பிப்பதன் மூலம், இந்தப் புகார் உண்மையானது மற்றும் மதுரை கிழக்குத் தொகுதிக்கு உட்பட்டது என்பதை உறுதிப்படுத்துகிறீர்கள். உங்கள் தரவு புகார் தீர்வுக்காக மட்டுமே பயன்படுத்தப்படும்.",

    // Form Errors
    "error.name": "முழு பெயர் தேவை.",
    "error.phone": "சரியான 10-இலக்க அலைபேசி எண்ணை உள்ளிடவும்.",
    "error.gender": "பாலினத்தைத் தேர்ந்தெடுக்கவும்.",
    "error.ward": "உங்கள் வார்டைத் தேர்ந்தெடுக்கவும்.",
    "error.address": "வீட்டு முகவரி தேவை.",
    "error.category": "புகார் வகையைத் தேர்ந்தெடுக்கவும்.",
    "error.desc": "விளக்கம் குறைந்தது 20 எழுத்துக்கள் இருக்க வேண்டும்.",
    "error.title": "புகாரின் தலைப்பு தேவை.",

    // Success
    "success.title": "புகார் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது",
    "success.sub": "உங்கள் புகார் கோப்பு செய்யப்பட்டுள்ளது. உங்கள் டிக்கெட் ஐடியை கீழே சேமித்துக்கொள்ளவும்.",
    "success.ticketId": "டிக்கெட் ஐடி",
    "success.timeline.received": "பெறப்பட்டது",
    "success.timeline.review": "பரிசீலனையில்",
    "success.timeline.progress": "நடவடிக்கையில்",
    "success.timeline.resolved": "தீர்க்கப்பட்டது",
    "success.note": "எங்கள் அலுவலகம் 3-5 வேலை நாட்களுக்குள் புகாரை மதிப்பாய்வு செய்து பதிலளிக்கும். பின்தொடர்வதற்கு, இந்த டிக்கெட் ஐடியை வழங்கவும்.",
    "success.another": "+ மற்றொரு புகாரைச் சமர்ப்பிக்கவும்",

    // Board
    "board.title": "பொதுப் பிரச்சனைகள் பலகை",
    "board.sub": "உங்கள் பகுதியில் மற்றவர்கள் எதிர்கொள்ளும் பிரச்சனைகளைப் பார்த்து, அவற்றுக்கு ஆதரவு தெரிவிக்கவும்.",
    "board.facingToo": "நானும் இதை எதிர்கொள்கிறேன்",
    "board.upvoted": "ஆதரவளித்தீர்கள்",
    "board.supports": "ஆதரவுகள்",
    "board.status": "நிலை",
    "board.category": "வகை",
    "board.area": "பகுதி",
    "board.priority": "முன்னுரிமை",
    "board.noIssues": "பொதுப் பிரச்சனைகள் எதுவும் இதுவரை பதிவு செய்யப்படவில்லை.",

    // Wall
    "wall.title": "தீர்வுச் சுவர் (Resolution Wall)",
    "wall.sub": "மதுரை கிழக்கு தொகுதியில் வெற்றிகரமாகத் தீர்க்கப்பட்ட புகார்கள் மற்றும் மக்கள் பணிகள்.",
    "wall.before": "முன்னர்",
    "wall.after": "பின்னர்",
    "wall.completed": "முடிக்கப்பட்ட தேதி",
    "wall.details": "தீர்வு விவரங்கள்",
    "wall.noResolutions": "தீர்வுச் சுவரில் இன்னும் எந்தப் பதிவுகளும் இல்லை.",

    // Track
    "track.title": "உங்கள் புகாரைக் கண்காணிக்கவும்",
    "track.sub": "விவரங்களை அறிய உங்கள் புகார் டிக்கெட் எண்ணை (உதாரணம்: TVK-2026-00001) உள்ளிடவும்.",
    "track.placeholder": "டிக்கெட் எண்ணை உள்ளிடவும் (e.g. TVK-2026-00001)",
    "track.search": "தேடுக",
    "track.notFound": "சரியான டிக்கெட் எண் கண்டறியப்படவில்லை. தயவுசெய்து சரிபார்க்கவும்.",
    "track.details": "புகார் விவரங்கள்",
    "track.current": "தற்போதைய நிலை",
    "track.assignedTo": "ஒதுக்கப்பட்ட தன்னார்வலர்",
    "track.noVolunteer": "இன்னும் ஒதுக்கப்படவில்லை",
    "track.adminNotes": "நிர்வாகக் குறிப்புகள்",

    // Admin
    "admin.loginTitle": "நிர்வாகி உள்நுழைவு",
    "admin.username": "பயனர் பெயர்",
    "admin.password": "கடவுச்சொல்",
    "admin.loginBtn": "உள்நுழைக",
    "admin.loginError": "தவறான பயனர் பெயர் அல்லது கடவுச்சொல்.",
    "admin.statsTitle": "தொகுதி புள்ளிவிவரங்கள்",
    "admin.totalComplaints": "மொத்த புகார்கள்",
    "admin.new": "புதியவை",
    "admin.assigned": "ஒதுக்கப்பட்டவை",
    "admin.inProgress": "நடவடிக்கையில்",
    "admin.pendingGovt": "அரசின் பரிசீலனையில்",
    "admin.resolved": "தீர்க்கப்பட்டவை",
    "admin.closed": "முடிவடைந்தவை",
    "admin.catDist": "வகை வாரியாகப் புகார்கள்",
    "admin.areaDist": "பகுதி வாரியாகப் புகார்கள்",
    "admin.trends": "மாதாந்திர போக்குகள்",
    "admin.hotspots": "அதிமுக்கிய முன்னுரிமை மண்டலங்கள்",
    "admin.hotspotsSub": "ஒரே பகுதியில் பல புகார்கள் வந்ததால் கண்டறியப்பட்டவை",
    "admin.mostSupported": "அதிகம் ஆதரிக்கப்பட்ட புகார்கள்",
    "admin.allTickets": "அனைத்து புகார்கள் மேலாண்மை",
    "admin.assignVolunteer": "தன்னார்வலரை நியமிக்கவும்",
    "admin.changeStatus": "நிலையை மாற்றுக",
    "admin.addNotes": "குறிப்புகளைச் சேர்க்கவும்",
    "admin.uploadAfterPhoto": "தீர்வுக்குப் பின் புகைப்படம்",
    "admin.resolutionDetails": "தீர்வு விவரங்கள் (தமிழ் & ஆங்கிலம்)",
    "admin.postToWall": "தீர்வுச் சுவரில் பதிவிடவும்",
    "admin.actionSave": "விவரங்களைப் புதுப்பி",
    "admin.announcements": "அறிவிப்புகள் மேலாண்மை",
    "admin.newAnnouncement": "புதிய அறிவிப்பு",
    "admin.announcementTitleTa": "அறிவிப்பு தலைப்பு (தமிழ்)",
    "admin.announcementTitleEn": "அறிவிப்பு தலைப்பு (English)",
    "admin.announcementContentTa": "அறிவிப்பு விவரம் (தமிழ்)",
    "admin.announcementContentEn": "அறிவிப்பு விவரம் (English)",
    "admin.addBtn": "அறிவிப்பைச் சேர்",
    "admin.active": "செயலில் உள்ளது",
    "admin.inactive": "செயலிழந்தது",

    // Categories
    "cat.health": "பொது சுகாதாரம்",
    "cat.electricity": "மின்சாரம்",
    "cat.water": "குடிநீர் வழங்கல்",
    "cat.drainage": "கழிவுநீர் பிரச்சனை",
    "cat.road": "சாலை & உள் கட்டமைப்பு",
    "cat.childAbuse": "குழந்தைகள் துன்புறுத்தல்",
    "cat.womenElderAbuse": "பெண்கள் & முதியவர்கள் துன்புறுத்தல்",
    "cat.animalCruelty": "விலங்குகளை துன்புறுத்தல்",
    "cat.encroachment": "பொது சொத்து ஆக்கிரமிப்பு",
    "cat.other": "மற்றவை",

    // Priority levels
    "priority.Low": "குறைந்த முன்னுரிமை",
    "priority.Medium": "நடுத்தர முன்னுரிமை",
    "priority.High": "அதிக முன்னுரிமை",
    "priority.Critical": "அதிமுக்கிய முன்னுரிமை"
  },
  en: {
    // Common
    "app.title": "Tamilaga Vetri Kazhagam | Constituency Complaint Portal",
    "app.footer": "© 2026 TVK Madurai East Assembly Constituency Office • Digital Governance Initiative",
    "app.confidential": "All complaints are strictly confidential",
    "common.loading": "Loading...",
    "common.submit": "Submit",
    "common.back": "Back",
    "common.save": "Save",
    "common.cancel": "Cancel",

    // Navigation
    "nav.home": "Home",
    "nav.submit": "File Complaint",
    "nav.track": "Track Status",
    "nav.board": "Public Issues",
    "nav.wall": "Resolution Wall",
    "nav.admin": "Official Login",
    "nav.logout": "Logout",

    // MLA Profile
    "mla.partyTag": "Tamilaga Vetri Kazhagam • Madurai East",
    "mla.name": "S. Karthikeyan",
    "mla.sub": "MA, LLB — Assembly Member, Madurai East Constituency",
    "mla.badge": "📍 Madurai East Constituency",
    "mla.quote": "\"Resolving your issues is my primary duty. I will always stand by your needs.\"",

    // Announcements
    "announcements.label": "Announcements",
    "announcements.fallback": "Welcome to the TVK Madurai East Constituency grievance portal! File your complaints here.",

    // Form
    "form.title": "Submit Your Complaint",
    "form.sub": "Fill in the details below — all fields marked * are required.",
    "form.personalInfo": "Personal Information",
    "form.name": "Full Name",
    "form.namePlaceholder": "Enter your full name",
    "form.phone": "Mobile Number",
    "form.phonePlaceholder": "10-digit mobile number",
    "form.gender": "Gender",
    "form.gender.male": "♂ Male",
    "form.gender.female": "♀ Female",
    "form.gender.other": "⊕ Other",
    "form.ward": "Ward / Area",
    "form.selectWard": "Select your ward",
    "form.email": "Email Address",
    "form.emailPlaceholder": "your@email.com",
    "form.emailOpt": "(Optional)",
    "form.address": "Residential Address",
    "form.addressPlaceholder": "Door No., Street, Area — Madurai East",
    
    "form.complaintDetails": "Complaint Details",
    "form.category": "Complaint Category",
    "form.desc": "Complaint Description",
    "form.descPlaceholder": "Describe your issue clearly — include location, how long the problem has persisted, and any action already taken.",
    "form.charNeeded": "chars needed",
    "form.charOk": "OK",
    
    "form.uploadPhoto": "Upload Photo",
    "form.uploadDoc": "Supporting Document (Optional)",
    "form.uploadHint": "JPG, PNG, PDF files • Max 5 MB",
    "form.uploadClick": "Click to attach photo or document",
    "form.gps": "GPS Location",
    "form.gpsBtn": "Get Current Location",
    "form.gpsSuccess": "Location Captured",
    "form.gpsHint": "Coordinates (Optional)",

    "form.submitBtn": "Submit Complaint",
    "form.submitting": "Submitting...",
    "form.submitNote": "By submitting, you confirm this complaint is genuine and relates to Madurai East constituency. Your data is used solely for grievance resolution.",

    // Form Errors
    "error.name": "Full name is required.",
    "error.phone": "Enter a valid 10-digit mobile number.",
    "error.gender": "Please select a gender.",
    "error.ward": "Please select your ward.",
    "error.address": "Residential address is required.",
    "error.category": "Please select a category.",
    "error.desc": "Description must be at least 20 characters.",
    "error.title": "Complaint title is required.",

    // Success
    "success.title": "Complaint Registered Successfully",
    "success.sub": "Your complaint has been filed. Please save your ticket ID below.",
    "success.ticketId": "Ticket ID",
    "success.timeline.received": "Received",
    "success.timeline.review": "Under Review",
    "success.timeline.progress": "In Progress",
    "success.timeline.resolved": "Resolved",
    "success.note": "Our office will review and respond within 3–5 working days. Quote your Ticket ID for follow-up.",
    "success.another": "+ Submit Another Complaint",

    // Board
    "board.title": "Community Issues Board",
    "board.sub": "View public complaints in your constituency and voice your support for issues that affect you.",
    "board.facingToo": "I Am Facing This Too",
    "board.upvoted": "Supported",
    "board.supports": "Supports",
    "board.status": "Status",
    "board.category": "Category",
    "board.area": "Area",
    "board.priority": "Priority",
    "board.noIssues": "No public issues have been registered yet.",

    // Wall
    "wall.title": "Resolution Wall",
    "wall.sub": "Visual highlights of successfully resolved citizen grievances and civic works in Madurai East.",
    "wall.before": "Before",
    "wall.after": "After",
    "wall.completed": "Completed Date",
    "wall.details": "Resolution Details",
    "wall.noResolutions": "No resolutions have been uploaded yet.",

    // Track
    "track.title": "Track Your Complaint",
    "track.sub": "Enter your unique complaint Ticket ID (e.g., TVK-2026-00001) to view the current status.",
    "track.placeholder": "Enter Ticket ID (e.g., TVK-2026-00001)",
    "track.search": "Track",
    "track.notFound": "No complaint was found with this Ticket ID. Please double check.",
    "track.details": "Complaint Details",
    "track.current": "Current Status",
    "track.assignedTo": "Assigned Volunteer",
    "track.noVolunteer": "Not yet assigned",
    "track.adminNotes": "Constituency Notes",

    // Admin
    "admin.loginTitle": "Admin Access Portal",
    "admin.username": "Username",
    "admin.password": "Password",
    "admin.loginBtn": "Authenticate",
    "admin.loginError": "Invalid credentials. Please try again.",
    "admin.statsTitle": "Constituency Dashboard",
    "admin.totalComplaints": "Total Grievances",
    "admin.new": "New",
    "admin.assigned": "Assigned",
    "admin.inProgress": "In Progress",
    "admin.pendingGovt": "Pending Govt Action",
    "admin.resolved": "Resolved",
    "admin.closed": "Closed",
    "admin.catDist": "Grievances by Category",
    "admin.areaDist": "Grievances by Ward / Area",
    "admin.trends": "Monthly Grievance Trends",
    "admin.hotspots": "High Priority Zones",
    "admin.hotspotsSub": "Hotspots automatically detected by matching Ward & Category density",
    "admin.mostSupported": "Most Supported Issues",
    "admin.allTickets": "All Registered Tickets",
    "admin.assignVolunteer": "Assign Volunteer",
    "admin.changeStatus": "Update Status",
    "admin.addNotes": "Add Notes",
    "admin.uploadAfterPhoto": "After Photo (Resolution)",
    "admin.resolutionDetails": "Resolution Details (Tamil & English)",
    "admin.postToWall": "Post to Resolution Wall",
    "admin.actionSave": "Save Updates",
    "admin.announcements": "Manage Announcements",
    "admin.newAnnouncement": "New Announcement",
    "admin.announcementTitleTa": "Announcement Title (Tamil)",
    "admin.announcementTitleEn": "Announcement Title (English)",
    "admin.announcementContentTa": "Content (Tamil)",
    "admin.announcementContentEn": "Content (English)",
    "admin.addBtn": "Publish Announcement",
    "admin.active": "Active",
    "admin.inactive": "Inactive",

    // Categories
    "cat.health": "Public Health",
    "cat.electricity": "Electricity",
    "cat.water": "Drinking Water",
    "cat.drainage": "Drainage / Sewage",
    "cat.road": "Road & Infrastructure",
    "cat.childAbuse": "Child Abuse",
    "cat.womenElderAbuse": "Women & Elder Abuse",
    "cat.animalCruelty": "Animal Cruelty",
    "cat.encroachment": "Public Property Encroachment",
    "cat.other": "Others",

    // Priority levels
    "priority.Low": "Low Priority",
    "priority.Medium": "Medium Priority",
    "priority.High": "High Priority",
    "priority.Critical": "Critical Priority"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("ta");

  useEffect(() => {
    const stored = localStorage.getItem("tvk_portal_lang") as Language;
    if (stored === "ta" || stored === "en") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("tvk_portal_lang", lang);
  };

  const t = (key: string): string => {
    // Return key translation or fall back to English or original key
    const currentDict = dictionary[language];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    const englishDict = dictionary["en"];
    if (englishDict && englishDict[key]) {
      return englishDict[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
