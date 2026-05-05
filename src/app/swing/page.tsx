'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SlidersHorizontal, ArrowRightLeft } from 'lucide-react';
import { getPartyColor, getCoalitionColor } from '@/lib/dataUtils';

export default function SwingCalculator() {
  const { filteredData, loading, selectedState, viewMode, uniqueParties } = useDashboard();
  
  const [targetParty, setTargetParty] = useState<string>('');
  const [swingVotes, setSwingVotes] = useState<number>(0);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  }

  // Set initial target party and reset if invalid
  React.useEffect(() => {
    if (uniqueParties.length > 0 && !uniqueParties.includes(targetParty)) {
      setTargetParty(selectedState === 'Kerala' && viewMode === 'coalition' ? 'LDF' : (selectedState === 'West Bengal' ? 'AITC' : 'CPI(M)'));
    }
  }, [uniqueParties, selectedState, viewMode, targetParty]);

  // Calculate Original Seats
  const originalSeats = { ...uniqueParties.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<string, number>) };
  filteredData.forEach(d => {
    const winner = selectedState === 'Kerala' && viewMode === 'coalition' ? d.leading_coalition_2026 : d.leading_party_2026_standard;
    if (winner) originalSeats[winner] = (originalSeats[winner] || 0) + 1;
  });

  // Calculate Projected Seats based on Swing
  const projectedSeats = { ...originalSeats };
  let flippedSeatsCount = 0;
  const flippedDetails: any[] = [];

  filteredData.forEach(d => {
    const winner = selectedState === 'Kerala' && viewMode === 'coalition' ? d.leading_coalition_2026 : d.leading_party_2026_standard;
    
    let runnerUp = d.trailing_party_2026_standard;
    if (selectedState === 'Kerala' && viewMode === 'coalition') {
      // Approximate trailing coalition for Kerala: LDF <-> UDF
      runnerUp = winner === 'LDF' ? 'UDF' : (winner === 'UDF' ? 'LDF' : 'LDF');
    }
    
    // If target party is winner, adding swing votes INCREASES margin. Subtracting DECREASES margin.
    // If target party is runnerUp, adding swing votes DECREASES margin. Subtracting INCREASES margin.
    
    if (winner === targetParty) {
      if (swingVotes < 0 && d.margin_2026 < Math.abs(swingVotes)) {
        // Target party lost the seat
        projectedSeats[winner]--;
        if (runnerUp) projectedSeats[runnerUp] = (projectedSeats[runnerUp] || 0) + 1;
        flippedSeatsCount++;
        flippedDetails.push({ name: d.canonical_constituency_name, from: winner, to: runnerUp || 'Unknown', newMargin: Math.abs(d.margin_2026 + swingVotes) });
      }
    } else if (runnerUp === targetParty || (targetParty && winner !== targetParty)) {
      // If target party is NOT the winner, we assume they are the primary challenger for simplicity in this absolute model
      if (swingVotes > 0 && d.margin_2026 < swingVotes) {
        // Target party gained the seat
        if (winner) projectedSeats[winner]--;
        projectedSeats[targetParty] = (projectedSeats[targetParty] || 0) + 1;
        flippedSeatsCount++;
        flippedDetails.push({ name: d.canonical_constituency_name, from: winner, to: targetParty, newMargin: Math.abs(swingVotes - d.margin_2026) });
      }
    }
  });

  const chartData = Object.keys(originalSeats).map(party => ({
    name: party,
    'Original Seats': originalSeats[party],
    'Projected Seats': projectedSeats[party]
  })).sort((a, b) => b['Original Seats'] - a['Original Seats']);

  const getChartColor = (name: string) => {
    return selectedState === 'Kerala' && viewMode === 'coalition' 
      ? getCoalitionColor(name)
      : getPartyColor(name);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Uniform Swing Calculator</h1>
        <p className="text-slate-500 mt-1">Model how absolute vote swings impact seat distribution across the state.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/3 space-y-4">
          <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider block">Target Party</label>
          <select 
            value={targetParty}
            onChange={(e) => setTargetParty(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          >
            {uniqueParties.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="w-full md:w-2/3 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider block">Absolute Vote Swing per Constituency</label>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${swingVotes > 0 ? 'bg-emerald-100 text-emerald-700' : swingVotes < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
              {swingVotes > 0 ? '+' : ''}{swingVotes.toLocaleString()} votes
            </span>
          </div>
          
          <input 
            type="range" 
            min="-20000" 
            max="20000" 
            step="500"
            value={swingVotes} 
            onChange={(e) => setSwingVotes(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>-20,000 (Loss)</span>
            <span>0</span>
            <span>+20,000 (Gain)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Seat Projection</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Original Seats" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Projected Seats" fill={getChartColor(targetParty)} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
            <h2 className="text-xl font-bold text-slate-800 flex items-center justify-between">
              Flipped Seats
              <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm">{flippedSeatsCount}</span>
            </h2>
          </div>
          <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
            {flippedDetails.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {flippedDetails.map((f, i) => (
                  <li key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <p className="font-bold text-slate-800 mb-1">{f.name}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">{f.from}</span>
                      <ArrowRightLeft size={14} className="text-slate-400" />
                      <span className="px-2 py-0.5 rounded text-white font-medium" style={{backgroundColor: getChartColor(f.to)}}>{f.to}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">New Proj. Margin: {f.newMargin.toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 p-6 text-center">
                No seats change hands at this swing level.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
