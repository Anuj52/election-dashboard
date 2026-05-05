'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { getPartyColor } from '@/lib/dataUtils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';

export default function Charts() {
  const { filteredData, loading, selectedState, viewMode } = useDashboard();

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  }

  // Prepare Bar Chart Data (Seats by Party)
  const partyCounts2021: Record<string, number> = {};
  const partyCounts2026: Record<string, number> = {};
  
  filteredData.forEach(d => {
    const p2021 = selectedState === 'Kerala' && viewMode === 'coalition' ? d.leading_coalition_2021 : d.leading_party_2021_standard;
    const p2026 = selectedState === 'Kerala' && viewMode === 'coalition' ? d.leading_coalition_2026 : d.leading_party_2026_standard;
    
    if (p2021) partyCounts2021[p2021] = (partyCounts2021[p2021] || 0) + 1;
    if (p2026) partyCounts2026[p2026] = (partyCounts2026[p2026] || 0) + 1;
  });

  const allParties = Array.from(new Set([...Object.keys(partyCounts2021), ...Object.keys(partyCounts2026)])).filter(Boolean);
  
  const barData = allParties.map(party => ({
    name: party,
    '2021 Seats': partyCounts2021[party] || 0,
    '2026 Seats': partyCounts2026[party] || 0,
  })).sort((a, b) => b['2026 Seats'] - a['2026 Seats']);

  const pieData2026 = allParties.map(party => ({
    name: party,
    value: partyCounts2026[party] || 0
  })).filter(d => d.value > 0);

  const scatterData = filteredData.map(d => ({
    name: d.canonical_constituency_name,
    margin2021: d.margin_2021,
    margin2026: d.margin_2026,
    flipped: d.party_flip ? 'Flipped' : 'Retained',
    party2026: selectedState === 'Kerala' && viewMode === 'coalition' ? d.leading_coalition_2026 : d.leading_party_2026_standard
  }));

  // Safe vs Marginal Seats Analysis
  const marginCategories = {
    'Marginal (< 5k)': 0,
    'Competitive (5k - 15k)': 0,
    'Safe (> 15k)': 0
  };

  filteredData.forEach(d => {
    if (d.margin_2026 < 5000) marginCategories['Marginal (< 5k)']++;
    else if (d.margin_2026 <= 15000) marginCategories['Competitive (5k - 15k)']++;
    else marginCategories['Safe (> 15k)']++;
  });

  const marginData = Object.keys(marginCategories).map(key => ({
    name: key,
    value: marginCategories[key as keyof typeof marginCategories]
  }));

  const MARGIN_COLORS = {
    'Marginal (< 5k)': '#ef4444',     // Red
    'Competitive (5k - 15k)': '#f59e0b', // Amber
    'Safe (> 15k)': '#10b981'         // Emerald
  };

  const getChartColor = (name: string) => {
    return selectedState === 'Kerala' && viewMode === 'coalition' 
      ? require('@/lib/dataUtils').getCoalitionColor(name)
      : require('@/lib/dataUtils').getPartyColor(name);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-xl border border-slate-100">
          <p className="font-bold text-slate-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium mt-1">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Visualizations</h1>
        <p className="text-slate-500 mt-1">Interactive charts comparing seat distribution and margins.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Seat Count by Party (2021 vs 2026)</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="2021 Seats" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="2026 Seats" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">2026 Party Seat Share</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData2026}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData2026.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getChartColor(entry.name)} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Seat Vulnerability (2026)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marginData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {marginData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MARGIN_COLORS[entry.name as keyof typeof MARGIN_COLORS]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Victory Margins: 2021 vs 2026</h2>
        <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="margin2021" name="2021 Margin" stroke="#94a3b8" tickFormatter={(v) => `${v/1000}k`} />
                <YAxis type="number" dataKey="margin2026" name="2026 Margin" stroke="#94a3b8" tickFormatter={(v) => `${v/1000}k`} />
                <ZAxis type="category" dataKey="name" name="Constituency" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 shadow-lg rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">{data.name}</p>
                          <p className="text-sm text-slate-600">2021 Margin: <span className="font-bold">{data.margin2021.toLocaleString()}</span></p>
                          <p className="text-sm text-slate-600">2026 Margin: <span className="font-bold">{data.margin2026.toLocaleString()}</span></p>
                          <p className="text-sm mt-2 font-medium" style={{ color: data.flipped === 'Flipped' ? '#ef4444' : '#10b981' }}>
                            {data.flipped} ({data.party2026})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Retained" data={scatterData.filter(d => d.flipped === 'Retained')} fill="#3b82f6" fillOpacity={0.6} />
                <Scatter name="Flipped" data={scatterData.filter(d => d.flipped === 'Flipped')} fill="#ef4444" fillOpacity={0.6} />
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
    </div>
  );
}
