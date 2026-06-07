"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { ThumbsUp, Calendar, MapPin, Tag } from "lucide-react";

interface ComplaintCardProps {
  complaint: {
    id: number;
    ticket_no: string;
    title: string;
    description: string;
    wardName: string;
    categoryName: string;
    categoryIcon: string;
    status: string;
    priority_level: string;
    photo_url?: string;
    created_at: string;
    support_count: number;
  };
  hasSupported: boolean;
  onSupport: (id: number) => void;
}

export default function ComplaintCard({ complaint, hasSupported, onSupport }: ComplaintCardProps) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  // Status styling configurations
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "New":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "Assigned":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "In Progress":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "Pending Government Action":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Resolved":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-slate-50 text-slate-800 border-slate-200";
    }
  };

  // Priority color indicators
  const getPriorityStyle = (level: string) => {
    switch (level) {
      case "Low":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "Medium":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "High":
        return "text-red-600 bg-red-50 border-red-100";
      case "Critical":
        return "text-red-900 bg-red-100 border-red-200 font-bold";
      default:
        return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const formattedDate = new Date(complaint.created_at).toLocaleDateString(
    language === "ta" ? "ta-IN" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="bg-white border border-[#DDD9D0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Photo Attachment if available */}
      {complaint.photo_url && (
        <div className="relative w-full h-48 bg-gray-100">
          <img 
            src={complaint.photo_url} 
            alt={complaint.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${getStatusStyle(complaint.status)}`}>
              {complaint.status}
            </span>
          </div>
        </div>
      )}

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#D4920F] uppercase tracking-wider">
            <span className="text-sm">{complaint.categoryIcon}</span>
            {complaint.categoryName}
          </span>
          {!complaint.photo_url && (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(complaint.status)}`}>
              {complaint.status}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-[#1C3557] font-bold text-lg mb-2 line-clamp-2 leading-snug">
          {complaint.title}
        </h4>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-[#6B7280] mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{complaint.wardName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm text-gray-600 mb-4 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
          {complaint.description}
        </p>

        {complaint.description.length > 130 && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-xs font-bold text-[#1C3557] hover:text-[#2A4A70] self-start mb-4"
          >
            {expanded ? "Read Less" : "Read More..."}
          </button>
        )}

        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-[#DDD9D0] flex items-center justify-between">
          <div className="flex gap-2">
            <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${getPriorityStyle(complaint.priority_level)}`}>
              {t(`priority.${complaint.priority_level}`)}
            </span>
            <span className="text-xs text-[#6B7280] bg-[#F4F2EE] px-2 py-0.5 rounded border border-[#DDD9D0]">
              {complaint.ticket_no}
            </span>
          </div>

          {/* Upvote support count */}
          <button
            onClick={() => onSupport(complaint.id)}
            disabled={hasSupported}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              hasSupported
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 cursor-default"
                : "bg-white text-[#1C3557] border-[#1C3557] hover:bg-slate-50 hover:scale-105 active:scale-95 cursor-pointer"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasSupported ? "fill-emerald-600" : ""}`} />
            <span>
              {hasSupported ? t("board.upvoted") : t("board.facingToo")} ({complaint.support_count})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
