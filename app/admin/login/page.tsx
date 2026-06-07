"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const { t } = useLanguage();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulated admin auth - credentials 'admin' and 'tvk2026'
    setTimeout(() => {
      if (username.trim() === "admin" && password === "tvk2026") {
        localStorage.setItem("tvk_admin_auth", "true");
        router.push("/admin/dashboard");
      } else {
        setError(t("admin.loginError"));
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#F4F2EE] px-4 py-16">
      <div className="bg-white border border-[#DDD9D0] w-full max-w-md rounded-xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
        
        {/* Emblem header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto text-2xl shadow-inner">
            🏛️
          </div>
          <h2 className="font-serif font-bold text-xl text-[#142840] uppercase tracking-wider">
            {t("admin.loginTitle")}
          </h2>
          <p className="text-[10px] uppercase font-bold text-[#D4920F] tracking-widest">
            TVK Madurai East Office
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111827]">
              {t("admin.username")}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#800020] outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111827]">
              {t("admin.password")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-3 py-2 border border-[#DDD9D0] rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#800020] outline-none transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#800020] hover:bg-[#A31D38] text-white font-bold rounded-lg text-sm shadow cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {t("admin.loginBtn")}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-[#DDD9D0]">
          <a href="/" className="text-xs text-[#6B7280] hover:text-[#800020] hover:underline font-bold transition-colors">
            ← Return to Public Portal
          </a>
        </div>

      </div>
    </div>
  );
}
