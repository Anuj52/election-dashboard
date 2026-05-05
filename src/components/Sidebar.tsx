'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PieChart, Map, Search, AlertCircle, MapPin, TrendingUp } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { 
    selectedState, setSelectedState,
    uniqueRegions, uniqueDistricts, uniqueParties,
    selectedRegions, setSelectedRegions,
    selectedDistricts, setSelectedDistricts,
    selectedParties, setSelectedParties,
    viewMode, setViewMode
  } = useDashboard();

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Charts', href: '/charts', icon: PieChart },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Swing Modeler', href: '/swing', icon: TrendingUp },
    { name: 'Deletions', href: '/deletions', icon: AlertCircle },
    { name: 'Explorer', href: '/explorer', icon: Search },
  ];

  const handleSelect = (setter: any, current: string[], value: string) => {
    if (current.includes(value)) {
      setter(current.filter(item => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed overflow-hidden z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Election Dashboard
        </h1>
      </div>

      <div className="px-4 mb-6">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Select State</label>
        <div className="relative">
          <select 
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg py-2 pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="West Bengal">West Bengal</option>
            <option value="Kerala">Kerala</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <MapPin size={16} />
          </div>
        </div>

        {selectedState === 'Kerala' && (
          <div className="mt-4">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">View Mode</label>
             <div className="flex bg-slate-800 rounded-lg p-1">
               <button 
                 onClick={() => setViewMode('party')}
                 className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'party' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
               >
                 Party
               </button>
               <button 
                 onClick={() => setViewMode('coalition')}
                 className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'coalition' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
               >
                 Coalition
               </button>
             </div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}

        <div className="mt-8 pt-6 border-t border-slate-800">
          <h2 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Filters</h2>
          
          <div className="space-y-6 px-2">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block px-2">
                {selectedState === 'Kerala' && viewMode === 'coalition' ? 'Coalition (2026)' : 'Party (2026)'}
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto px-2 custom-scrollbar">
                {uniqueParties.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" 
                      className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                      checked={selectedParties.includes(p)}
                      onChange={() => handleSelect(setSelectedParties, selectedParties, p)}
                    />
                    <span className="truncate">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {uniqueRegions.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block px-2">Region</label>
                <div className="space-y-1 max-h-32 overflow-y-auto px-2 custom-scrollbar">
                  {uniqueRegions.map(r => (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" 
                        className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                        checked={selectedRegions.includes(r)}
                        onChange={() => handleSelect(setSelectedRegions, selectedRegions, r)}
                      />
                      <span className="truncate">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {uniqueDistricts.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block px-2">District</label>
                <div className="space-y-1 max-h-40 overflow-y-auto px-2 custom-scrollbar">
                  {uniqueDistricts.map(d => (
                    <label key={d} className="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" 
                        className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                        checked={selectedDistricts.includes(d)}
                        onChange={() => handleSelect(setSelectedDistricts, selectedDistricts, d)}
                      />
                      <span className="truncate">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800 shrink-0">
        <a 
          href="https://github.com/Anuj52" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-2"
        >
          <span>Built by <span className="font-semibold text-emerald-400">Anuj</span></span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
