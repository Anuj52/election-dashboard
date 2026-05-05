'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { AlertTriangle, SlidersHorizontal, ArrowRightLeft } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Legend } from 'recharts';

export default function Deletions() {
  const { filteredData, loading, selectedState } = useDashboard();
  const [modelerPercentage, setModelerPercentage] = useState<number>(80);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  }

  if (selectedState !== 'West Bengal') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4 animate-in fade-in duration-500">
        <div className="bg-orange-100 text-orange-500 p-4 rounded-full">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No Deletion Data Available</h2>
        <p className="text-slate-500 max-w-md">Voter deletion analysis is currently only available for the West Bengal dataset.</p>
      </div>
    );
  }

  const totalDeletions = filteredData.reduce((sum, d) => sum + (d.total_deletions || 0), 0);
  const exceedCount = filteredData.filter(d => d.deletions_exceed_margin).length;
  const avgRatio = filteredData.length ? (filteredData.reduce((sum, d) => sum + (d.deletion_margin_ratio || 0), 0) / filteredData.length) : 0;

  // What-If Modeler Logic
  // Assumption: If X% of deleted voters had voted for the trailing party, would the trailing party have won?
  const simulatedFlips = filteredData.map(d => {
    const trailingVotesGained = (d.total_deletions || 0) * (modelerPercentage / 100);
    // Rough approximation: The margin is simply reduced by the votes gained by the trailing party.
    // If trailing votes gained > current margin, the seat flips back to the trailing party.
    const newMargin = d.margin_2026 - trailingVotesGained;
    const wouldFlip = newMargin < 0;
    
    return {
      ...d,
      wouldFlip,
      newMargin: Math.abs(newMargin),
      projectedWinner: wouldFlip ? d.trailing_party_2026_standard : d.leading_party_2026_standard
    };
  }).filter(d => d.wouldFlip);

  const scatterData = filteredData.map(d => ({
    name: d.canonical_constituency_name,
    margin2021: d.margin_2021,
    deletions: d.total_deletions,
    ratio: d.deletion_margin_ratio,
    exceeds: d.deletions_exceed_margin ? 'Exceeds Margin' : 'Normal',
  }));

  const suspiciousList = [...filteredData]
    .filter(d => d.flip_to_bjp === 1)
    .sort((a, b) => (b.deletion_margin_ratio || 0) - (a.deletion_margin_ratio || 0))
    .slice(0, 20);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Voter Deletion Analysis</h1>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4 rounded-r-lg flex gap-3">
          <AlertTriangle className="text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Disclaimer:</strong> This tab contains raw data analysis. Metrics and relationships shown here represent initial exploratory analysis and do not imply causation or establish proven irregularities without further verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-slate-500 mb-1" title="Sum of Adj and Asd Deletions">Total Deletions</p>
          <h3 className="text-3xl font-bold text-slate-800">{totalDeletions.toLocaleString()}</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-slate-500 mb-1" title="Number of constituencies where deletions exceed the 2021 victory margin">Deletions &gt; Margin</p>
          <h3 className="text-3xl font-bold text-slate-800">{exceedCount} <span className="text-lg text-slate-400 font-medium">/ {filteredData.length}</span></h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-slate-500 mb-1" title="Average ratio of deletions to the 2021 margin">Avg Deletion/Margin Ratio</p>
          <h3 className="text-3xl font-bold text-slate-800">{avgRatio.toFixed(2)}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="text-emerald-500" /> 
              What-If Deletion Modeler
            </h2>
            <p className="text-slate-500 text-sm mt-1">Simulate the impact of deleted voters on the final outcome.</p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[250px]">
            <p className="text-sm font-semibold text-slate-600 mb-2">If <span className="text-emerald-600 font-bold">{modelerPercentage}%</span> of deleted voters voted for the trailing party...</p>
            <input 
              type="range" 
              min="50" 
              max="100" 
              step="5"
              value={modelerPercentage} 
              onChange={(e) => setModelerPercentage(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-400 font-medium mt-1">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
            <h3 className="text-emerald-800 font-bold mb-2">Projected Flipped Seats</h3>
            <p className="text-4xl font-black text-emerald-600">{simulatedFlips.length}</p>
            <p className="text-sm text-emerald-700 mt-2 font-medium">seats would change hands under this scenario.</p>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="max-h-[150px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="py-2 px-4 font-semibold text-slate-600">Constituency</th>
                    <th className="py-2 px-4 font-semibold text-slate-600 text-right">Proj. Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simulatedFlips.length > 0 ? simulatedFlips.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-white">
                      <td className="py-2 px-4 font-medium text-slate-800">{row.canonical_constituency_name}</td>
                      <td className="py-2 px-4 text-right">
                        <span className="px-2 py-1 bg-slate-200 rounded text-xs font-bold text-slate-700">
                          {row.projectedWinner || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={2} className="py-4 text-center text-slate-500">No seats would flip under this assumption.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Total Deletions vs 2021 Margin</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="margin2021" name="2021 Margin" stroke="#94a3b8" />
              <YAxis type="number" dataKey="deletions" name="Total Deletions" stroke="#94a3b8" />
              <ZAxis type="category" dataKey="name" name="Constituency" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 shadow-lg rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">{data.name}</p>
                        <p className="text-sm text-slate-600">2021 Margin: <span className="font-bold">{data.margin2021?.toLocaleString()}</span></p>
                        <p className="text-sm text-slate-600">Total Deletions: <span className="font-bold">{data.deletions?.toLocaleString()}</span></p>
                        <p className="text-sm text-slate-600">Ratio: <span className="font-bold">{data.ratio?.toFixed(2)}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Normal" data={scatterData.filter(d => d.exceeds === 'Normal')} fill="#10b981" fillOpacity={0.6} />
              <Scatter name="Exceeds Margin" data={scatterData.filter(d => d.exceeds === 'Exceeds Margin')} fill="#ef4444" fillOpacity={0.6} />
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Suspicious Constituencies (Flipped to BJP with High Deletion Ratio)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4">Constituency</th>
                <th className="p-4">District</th>
                <th className="p-4 text-right">2021 Margin</th>
                <th className="p-4 text-right">2026 Margin</th>
                <th className="p-4 text-right">Total Deletions</th>
                <th className="p-4 text-right">Deletion Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {suspiciousList.length > 0 ? suspiciousList.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{row.canonical_constituency_name}</td>
                  <td className="p-4 text-slate-600">{row.district}</td>
                  <td className="p-4 text-right font-mono text-slate-600">{row.margin_2021?.toLocaleString() || 'N/A'}</td>
                  <td className="p-4 text-right font-mono text-slate-600">{row.margin_2026?.toLocaleString() || 'N/A'}</td>
                  <td className="p-4 text-right font-mono text-slate-800 font-medium">{row.total_deletions?.toLocaleString() || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded font-bold ${
                      (row.deletion_margin_ratio || 0) > 1.0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {row.deletion_margin_ratio?.toFixed(2) || 'N/A'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No suspicious constituencies found based on current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
