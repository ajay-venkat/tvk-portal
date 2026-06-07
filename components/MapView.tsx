"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface ComplaintMapItem {
  id: number;
  ticket_no: string;
  title: string;
  wardName: string;
  categoryName: string;
  priority_level: string;
  status: string;
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  items: ComplaintMapItem[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  selectedCoords?: [number, number] | null;
}

export default function MapView({
  items,
  center = [13.1186, 80.2796], // Center of R.K. Nagar
  zoom = 13,
  interactive = false,
  onMapClick,
  selectedCoords
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically load leaflet on the client side only
    let L: any;
    
    async function initMap() {
      if (!mapContainerRef.current) return;
      
      L = await import("leaflet");
      
      // Clean up previous map if it exists
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Initialize map
      const map = L.map(mapContainerRef.current).setView(center, zoom);
      mapRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Event listener for map clicks (if interactive for location picking)
      if (interactive && onMapClick) {
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          onMapClick(lat, lng);
        });
      }

      // Render markers for active issues
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      items.forEach(item => {
        if (!item.latitude || !item.longitude) return;

        // Choose color based on priority
        let color = "#10B981"; // Low (Green)
        if (item.priority_level === "Medium") color = "#F59E0B"; // Orange
        else if (item.priority_level === "High") color = "#EF4444"; // Red
        else if (item.priority_level === "Critical") color = "#7F1D1D"; // Dark Maroon

        const marker = L.circleMarker([item.latitude, item.longitude], {
          radius: 9,
          fillColor: color,
          color: "#FFFFFF",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(map);

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
            <div style="font-weight: bold; font-size: 13px; color: #1C3557; margin-bottom: 2px;">${item.ticket_no}</div>
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: ${color}; letter-spacing: 0.5px; margin-bottom: 6px;">
              ${item.priority_level} Priority
            </div>
            <div style="font-weight: 500; font-size: 12px; margin-bottom: 4px; color: #111827;">${item.title}</div>
            <div style="font-size: 11px; color: #6B7280; margin-bottom: 4px;">
              📍 ${item.wardName} • ${item.categoryName}
            </div>
            <div style="display: inline-block; font-size: 10px; font-weight: bold; background: #F4F2EE; padding: 2px 6px; border-radius: 4px; border: 1px solid #DDD9D0; color: #1C3557;">
              ${item.status}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      // Show temporary pin if selecting location
      if (selectedCoords) {
        const pin = L.marker(selectedCoords).addTo(map);
        pin.bindPopup("Selected Position").openPopup();
        markersRef.current.push(pin);
      }
    }

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [items, selectedCoords]);

  // Update selected marker position dynamically
  useEffect(() => {
    if (!mapRef.current || !selectedCoords) return;
    
    // Smoothly pan map to selected coordinate
    mapRef.current.setView(selectedCoords, 15);
  }, [selectedCoords]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-xl border border-[#DDD9D0] bg-[#FAFAF8] shadow-inner" 
      style={{ minHeight: "350px", zIndex: 1 }} 
    />
  );
}
