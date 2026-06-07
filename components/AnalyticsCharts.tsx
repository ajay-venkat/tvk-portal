"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";

interface ChartDataPoint {
  name: string;
  value: number;
}

interface TrendDataPoint {
  month: string;
  tickets: number;
}

interface AnalyticsChartsProps {
  categoryData: ChartDataPoint[];
  areaData: ChartDataPoint[];
  priorityData: ChartDataPoint[];
  trendData: TrendDataPoint[];
}

export default function AnalyticsCharts({
  categoryData,
  areaData,
  priorityData,
  trendData
}: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-sm text-[#6B7280]">Loading charts...</div>;
  }

  // TVK Harmonious Color Palette
  const PRIORITY_COLORS = {
    Low: "#10B981",       // Green
    Medium: "#F59E0B",    // Orange
    High: "#EF4444",      // Red
    Critical: "#7F1D1D"   // Maroon
  };

  const THEME_COLORS = ["#1C3557", "#D4920F", "#2A4A70", "#142840", "#A0AEBB", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#6B7280"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* 1. Category Distribution */}
      <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#1C3557] text-sm uppercase tracking-wider mb-4 border-b border-[#DDD9D0] pb-2">
          Grievances by Category
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 10 }} interval={0} angle={-35} textAnchor="end" />
              <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} allowDecimals={false} />
              <Tooltip cursor={{ fill: "rgba(28, 53, 87, 0.05)" }} />
              <Bar dataKey="value" name="Grievances" fill="#1C3557" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Area Distribution */}
      <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#1C3557] text-sm uppercase tracking-wider mb-4 border-b border-[#DDD9D0] pb-2">
          Grievances by Ward
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={areaData} margin={{ bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 10 }} interval={0} angle={-35} textAnchor="end" />
              <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} allowDecimals={false} />
              <Tooltip cursor={{ fill: "rgba(28, 53, 87, 0.05)" }} />
              <Bar dataKey="value" name="Grievances" fill="#D4920F" radius={[4, 4, 0, 0]}>
                {areaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={THEME_COLORS[(index + 3) % THEME_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Monthly Trends */}
      <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#1C3557] text-sm uppercase tracking-wider mb-4 border-b border-[#DDD9D0] pb-2">
          Monthly Trends (Tickets Submitted)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ left: -15, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F2EE" />
              <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="tickets" 
                name="New Complaints" 
                stroke="#1C3557" 
                strokeWidth={3}
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Priority Breakdown */}
      <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#1C3557] text-sm uppercase tracking-wider mb-4 border-b border-[#DDD9D0] pb-2">
          Priority Distribution
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => {
                    const color = PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || "#1C3557";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 text-left pl-4 space-y-2">
            {priorityData.map((entry, index) => {
              const color = PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || "#1C3557";
              return (
                <div key={entry.name} className="flex items-center text-xs">
                  <span className="w-3 h-3 rounded-full mr-2 inline-block" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-[#111827] mr-1">{entry.name}:</span>
                  <span className="text-[#6B7280]">{entry.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}
