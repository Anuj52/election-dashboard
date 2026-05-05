'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { getPartyColor } from '@/lib/dataUtils';
import { Search, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Explorer() {
  const { filteredData, loading, selectedState } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  }

  const searchResults = filteredData.filter(d => 
    d.canonical_constituency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.leading_candidate_2026?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Constituency Explorer</h1>
        <p className="text-slate-500 mt-1">Search and compare specific constituency results.</p>
      </div>

      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-4 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm transition-shadow"
          placeholder="Search by constituency name, district, or candidate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {searchResults.length > 0 ? searchResults.map((constituency, index) => (
          <ConstituencyCard key={index} data={constituency} state={selectedState} />
        )) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500 text-lg">No constituencies found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConstituencyCard({ data, state }: { data: any, state: string }) {
  const isFlipped = data.party_flip;
  const party2021Color = getPartyColor(data.leading_party_2021_standard);
  const party2026Color = getPartyColor(data.leading_party_2026_standard);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {data.canonical_constituency_name} 
            <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
              {state === 'West Bengal' ? data.district : `Const No: ${data['const._no.']}`}
            </span>
          </h2>
          
          <div className="mt-2 flex items-center gap-2">
            {isFlipped ? (
              <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-bold border border-red-100">
                <RefreshCw size={14} /> Party Flipped
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold border border-emerald-100">
                <CheckCircle2 size={14} /> Retained
              </span>
            )}
            
            {state === 'West Bengal' && data.deletion_margin_ratio > 0 && (
              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1 rounded-full text-sm font-medium border border-slate-200">
                Deletion Ratio: <strong>{data.deletion_margin_ratio?.toFixed(2)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="p-6 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.05]" style={{ backgroundColor: party2021Color }} />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">2021 Result</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Winning Candidate</p>
                <p className="text-lg font-semibold text-slate-800">{data.leading_candidate_2021 || 'N/A'}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Party</p>
                  <span className="px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm inline-block" style={{ backgroundColor: party2021Color }}>
                    {data.leading_party_2021_standard || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Margin</p>
                  <p className="text-lg font-mono font-medium text-slate-700">{data.margin_2021?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.05]" style={{ backgroundColor: party2026Color }} />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">2026 Result</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Winning Candidate</p>
                <p className="text-lg font-semibold text-slate-800">{data.leading_candidate_2026 || 'N/A'}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Party</p>
                  <span className="px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm inline-block" style={{ backgroundColor: party2026Color }}>
                    {data.leading_party_2026_standard || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Margin</p>
                  <p className="text-lg font-mono font-medium text-slate-700">{data.margin_2026?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
