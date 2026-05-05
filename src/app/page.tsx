'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Users, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { getPartyColor } from '@/lib/dataUtils';

export default function Overview() {
  const { filteredData, loading, selectedState } = useDashboard();
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const totalSeats = filteredData.length;
  
  // Dynamic KPIs based on State
  let party1Name = selectedState === 'Kerala' ? 'CPI(M)' : 'AITC';
  let party2Name = selectedState === 'Kerala' ? 'INC' : 'BJP';
  
  if (selectedState === 'Kerala') {
    // For Kerala, coalitions are more important, but we'll show main parties or coalitions
    // We can also show LDF vs UDF if we had the data mapped cleanly, but let's stick to main parties for parity
  }

  const p1_2021 = filteredData.filter(d => d.leading_party_2021_standard === party1Name).length;
  const p1_2026 = filteredData.filter(d => d.leading_party_2026_standard === party1Name).length;
  const p1Delta = p1_2026 - p1_2021;

  const p2_2021 = filteredData.filter(d => d.leading_party_2021_standard === party2Name).length;
  const p2_2026 = filteredData.filter(d => d.leading_party_2026_standard === party2Name).length;
  const p2Delta = p2_2026 - p2_2021;

  const partyFlips = filteredData.filter(d => d.party_flip).length;

  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig !== null) {
      sortableData.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">High-level summary of the 2021 vs 2026 assembly election results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Seats" value={totalSeats} icon={Users} color="bg-blue-500" />
        <MetricCard title={`${party1Name} Seats (2026)`} value={p1_2026} delta={p1Delta} icon={TrendingUp} color="bg-emerald-500" />
        <MetricCard title={`${party2Name} Seats (2026)`} value={p2_2026} delta={p2Delta} icon={TrendingUp} color="bg-orange-500" />
        <MetricCard title="Party Flips" value={partyFlips} icon={RefreshCw} color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Constituency Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('canonical_constituency_name')}>Constituency{getSortIcon('canonical_constituency_name')}</th>
                {selectedState === 'West Bengal' && (
                  <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('district')}>District{getSortIcon('district')}</th>
                )}
                {selectedState === 'Kerala' && (
                  <th className="p-4">Coalition</th>
                )}
                <th className="p-4">2021 Party</th>
                <th className="p-4">2026 Party</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors text-right" onClick={() => requestSort('margin_2026')}>2026 Margin{getSortIcon('margin_2026')}</th>
                <th className="p-4 text-center">Flip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedData.slice(0, 100).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{row.canonical_constituency_name}</td>
                  {selectedState === 'West Bengal' && (
                    <td className="p-4 text-slate-600">{row.district}</td>
                  )}
                  {selectedState === 'Kerala' && (
                    <td className="p-4 text-slate-600 font-bold">{row.leading_coalition_2026}</td>
                  )}
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: getPartyColor(row.leading_party_2021_standard) }}>
                      {row.leading_party_2021_standard}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: getPartyColor(row.leading_party_2026_standard) }}>
                      {row.leading_party_2026_standard}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-600">{row.margin_2026.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    {row.party_flip ? <span className="inline-flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded font-medium text-xs"><RefreshCw size={12}/> Flipped</span> : <span className="text-slate-300">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedData.length > 100 && (
            <div className="p-4 text-center text-sm text-slate-500 border-t border-slate-100">
              Showing first 100 results. Use filters to narrow down.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, delta, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value.toLocaleString()}</h3>
          {delta !== undefined && (
            <div className={`mt-2 flex items-center text-sm font-medium ${delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {delta > 0 ? '+' : ''}{delta} vs 2021
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-xl text-white shadow-inner`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
