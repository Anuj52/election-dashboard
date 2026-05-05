'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useDashboard } from '@/context/DashboardContext';

// Dynamically import the map component with SSR disabled
// Leaflet requires the window object, which isn't available during server-side rendering
const MapComponent = dynamic(
  () => import('../../components/MapComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[600px] items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-slate-500 font-medium">Loading Map Data...</p>
        </div>
      </div>
    )
  }
);

export default function MapPage() {
  const { loading } = useDashboard();

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Constituency Map</h1>
        <p className="text-slate-500 mt-1">Geographic distribution of election results.</p>
      </div>

      <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        <MapComponent />
      </div>
    </div>
  );
}
