'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from '@/context/DashboardContext';
import { getPartyColor, getCoalitionColor } from '@/lib/dataUtils';
import { Layers } from 'lucide-react';

export default function MapComponent() {
  const { filteredData, selectedState, viewMode } = useDashboard();
  const [geoData, setGeoData] = useState<any>(null);
  const [mapMode, setMapMode] = useState<'party' | 'flip'>('party');

  useEffect(() => {
    const geojsonFile = selectedState === 'Kerala' ? '/kerala_assembly.geojson' : '/west_bengal_ac.geojson';
    fetch(geojsonFile)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load geojson:", err));
  }, [selectedState]);

  if (!geoData) {
    return null; // Handled by loader in parent
  }

  const getFeatureStyle = (feature: any) => {
    let propName = feature.properties.AC_NAME || feature.properties.ac_name || feature.properties.name || feature.properties.KND_NAME || feature.properties.Asmbly_Con || feature.properties.ASSEMBLY;
    
    // Find matching data row
    const row = filteredData.find(d => {
      if (!propName) return false;
      const geoName = String(propName).toLowerCase().replace(/[^a-z0-9]/g, '');
      const csvName = String(d.canonical_constituency_name).toLowerCase().replace(/[^a-z0-9]/g, '');
      return geoName === csvName || geoName.includes(csvName) || csvName.includes(geoName);
    });

    let fillColor = '#e2e8f0'; // default empty
    let fillOpacity = 0.2;

    if (row) {
      if (mapMode === 'party') {
        if (selectedState === 'Kerala' && viewMode === 'coalition') {
          fillColor = getCoalitionColor(row.leading_coalition_2026);
        } else {
          fillColor = getPartyColor(row.leading_party_2026_standard);
        }
        fillOpacity = 0.8;
      } else {
        // Correct party_flip handling
        fillColor = row.party_flip ? '#ef4444' : '#3b82f6';
        fillOpacity = row.party_flip ? 0.8 : 0.4;
      }
    }

    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: '#ffffff', // border color
      dashArray: '3',
      fillOpacity
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    let propName = feature.properties.AC_NAME || feature.properties.ac_name || feature.properties.name || feature.properties.KND_NAME || feature.properties.Asmbly_Con || feature.properties.ASSEMBLY;
    
    const row = filteredData.find(d => {
      if (!propName) return false;
      const geoName = String(propName).toLowerCase().replace(/[^a-z0-9]/g, '');
      const csvName = String(d.canonical_constituency_name).toLowerCase().replace(/[^a-z0-9]/g, '');
      return geoName === csvName || geoName.includes(csvName) || csvName.includes(geoName);
    });

    if (row) {
      const winnerName = selectedState === 'Kerala' && viewMode === 'coalition' ? row.leading_coalition_2026 : row.leading_party_2026_standard;
      const winnerColor = selectedState === 'Kerala' && viewMode === 'coalition' ? getCoalitionColor(row.leading_coalition_2026) : getPartyColor(row.leading_party_2026_standard);
      
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2 border-b pb-1">${row.canonical_constituency_name}</h3>
          <p class="text-sm mb-1"><b>2026 Winner:</b> ${row.leading_candidate_2026}</p>
          <p class="text-sm mb-1"><b>${viewMode === 'coalition' ? 'Coalition' : 'Party'}:</b> <span class="px-2 py-0.5 rounded text-white text-xs font-bold" style="background-color: ${winnerColor}">${winnerName}</span></p>
          <p class="text-sm mb-1"><b>Margin:</b> ${row.margin_2026?.toLocaleString()}</p>
          ${row.party_flip ? `<p class="text-sm text-red-600 mt-2 font-bold">Flipped from ${selectedState === 'Kerala' && viewMode === 'coalition' ? row.leading_coalition_2021 : row.leading_party_2021_standard}</p>` : ''}
        </div>
      `;
      layer.bindPopup(popupContent);
    } else {
      layer.bindPopup(`<b>${propName || 'Unknown'}</b><br/>No data available in current filter.`);
    }

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({
          weight: 3,
          color: '#334155',
          dashArray: '',
          fillOpacity: 1
        });
        l.bringToFront();
      },
      mouseout: (e: any) => {
        // Reset style
        e.target.setStyle(getFeatureStyle(feature));
      }
    });
  };

  const center = selectedState === 'Kerala' ? [10.8505, 76.2711] : [23.5, 87.5];
  const zoom = selectedState === 'Kerala' ? 7 : 7;

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-2 flex gap-2 border border-slate-200">
        <button 
          onClick={() => setMapMode('party')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mapMode === 'party' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          2026 Party
        </button>
        <button 
          onClick={() => setMapMode('flip')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mapMode === 'flip' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          Flipped Seats
        </button>
      </div>

      <MapContainer 
        center={center as [number, number]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {geoData && (
          <GeoJSON 
            key={`${selectedState}-${mapMode}`} // Force re-render when state or mode changes
            data={geoData} 
            style={getFeatureStyle}
            onEachFeature={onEachFeature}
          />
        )}
        <MapUpdater center={center as [number, number]} zoom={zoom} />
      </MapContainer>
    </div>
  );
}

// Component to dynamically update map center when state changes
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}
