'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ElectionData, fetchElectionData } from '../lib/dataUtils';

interface DashboardContextType {
  data: ElectionData[];
  filteredData: ElectionData[];
  loading: boolean;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedRegions: string[];
  selectedDistricts: string[];
  selectedParties: string[];
  setSelectedRegions: (regions: string[]) => void;
  setSelectedDistricts: (districts: string[]) => void;
  setSelectedParties: (parties: string[]) => void;
  uniqueRegions: string[];
  uniqueDistricts: string[];
  uniqueParties: string[];
  viewMode: 'party' | 'coalition';
  setViewMode: (mode: 'party' | 'coalition') => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ElectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('West Bengal');
  const [viewMode, setViewMode] = useState<'party' | 'coalition'>('party');
  
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  
  // URL Syncing - Initial Load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stateParam = params.get('state');
      if (stateParam === 'West Bengal' || stateParam === 'Kerala') setSelectedState(stateParam);
      
      const viewParam = params.get('viewMode');
      if (viewParam === 'party' || viewParam === 'coalition') setViewMode(viewParam);
      
      const regionsParam = params.get('regions');
      if (regionsParam) setSelectedRegions(regionsParam.split(','));
      
      const districtsParam = params.get('districts');
      if (districtsParam) setSelectedDistricts(districtsParam.split(','));
      
      const partiesParam = params.get('parties');
      if (partiesParam) setSelectedParties(partiesParam.split(','));
    }
  }, []);

  // URL Syncing - Update URL when state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      const params = new URLSearchParams(window.location.search);
      
      params.set('state', selectedState);
      params.set('viewMode', viewMode);
      
      if (selectedRegions.length > 0) params.set('regions', selectedRegions.join(','));
      else params.delete('regions');
      
      if (selectedDistricts.length > 0) params.set('districts', selectedDistricts.join(','));
      else params.delete('districts');
      
      if (selectedParties.length > 0) params.set('parties', selectedParties.join(','));
      else params.delete('parties');
      
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, [selectedState, viewMode, selectedRegions, selectedDistricts, selectedParties, loading]);

  useEffect(() => {
    setLoading(true);
    fetchElectionData(selectedState).then(fetched => {
      setData(fetched);
      setLoading(false);
      // Reset filters when state changes
      setSelectedRegions([]);
      setSelectedDistricts([]);
      setSelectedParties([]);
    }).catch(err => {
      console.error("Failed to load data", err);
      setLoading(false);
    });
  }, [selectedState]);

  const uniqueRegions = Array.from(new Set(data.map(d => d.region).filter(r => r && r !== 'N/A'))).sort();
  const uniqueDistricts = Array.from(new Set(data.map(d => d.district).filter(d => d && d !== 'N/A'))).sort();
  const uniqueParties = Array.from(new Set(data.map(d => viewMode === 'coalition' && selectedState === 'Kerala' ? d.leading_coalition_2026 : d.leading_party_2026_standard).filter(Boolean))).sort();

  const filteredData = React.useMemo(() => {
    return data.filter(d => {
      const matchRegion = selectedRegions.length === 0 || selectedRegions.includes(d.region);
      const matchDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(d.district);
      
      const partyValue = viewMode === 'coalition' && selectedState === 'Kerala' ? d.leading_coalition_2026 : d.leading_party_2026_standard;
      const matchParty = selectedParties.length === 0 || selectedParties.includes(partyValue);
      
      return matchRegion && matchDistrict && matchParty;
    });
  }, [data, selectedRegions, selectedDistricts, selectedParties, viewMode, selectedState]);

  return (
    <DashboardContext.Provider value={{
      data,
      filteredData,
      loading,
      selectedState,
      setSelectedState,
      selectedRegions,
      selectedDistricts,
      selectedParties,
      setSelectedRegions,
      setSelectedDistricts,
      setSelectedParties,
      uniqueRegions,
      uniqueDistricts,
      uniqueParties,
      viewMode,
      setViewMode
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
