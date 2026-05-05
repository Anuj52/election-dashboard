import Papa from 'papaparse';

export interface ElectionData {
  "const._no.": string;
  canonical_constituency_name: string;
  leading_candidate_2021: string;
  leading_party_2021_standard: string;
  margin_2021: number;
  leading_coalition_2021: string;
  leading_candidate_2026: string;
  leading_party_2026_standard: string;
  trailing_candidate_2026: string;
  trailing_party_2026_standard: string;
  margin_2026: number;
  leading_coalition_2026: string;
  party_flip: boolean;
  coalition_flip: boolean;
  region: string;
  district: string;
  adj_deletions: number;
  asd_deletions: number;
  total_deletions: number;
  deletions_exceed_margin: boolean;
  deletion_margin_ratio: number;
  flip_to_bjp: number;
}

export const fetchElectionData = async (stateName: string): Promise<ElectionData[]> => {
  const file = stateName === 'Kerala' ? '/kerala_election.csv' : '/west_bengal_election.csv';
  const response = await fetch(file);
  const text = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse<any>(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const normalized = results.data.map(row => {
          if (stateName === 'Kerala') {
            return {
              "const._no.": row.const_no,
              canonical_constituency_name: row.constituency,
              leading_candidate_2021: row.leading_candidate_2021,
              leading_party_2021_standard: row.leading_party_2021,
              margin_2021: row.margin_2021,
              leading_coalition_2021: row.coalition_2021,
              leading_candidate_2026: row.leading_candidate_2026,
              leading_party_2026_standard: row.leading_party_2026,
              trailing_candidate_2026: row.trailing_candidate_2026,
              trailing_party_2026_standard: row.trailing_party_2026,
              margin_2026: row.margin_2026,
              leading_coalition_2026: row.coalition_2026,
              party_flip: String(row.party_changed).toLowerCase() === 'true',
              coalition_flip: String(row.coalition_changed).toLowerCase() === 'true',
              region: 'N/A',
              district: 'N/A',
              adj_deletions: 0,
              asd_deletions: 0,
              total_deletions: 0,
              deletions_exceed_margin: false,
              deletion_margin_ratio: 0,
              flip_to_bjp: row.leading_party_2026 === 'BJP' && row.leading_party_2021 !== 'BJP' ? 1 : 0
            } as ElectionData;
          } else {
            return {
              ...row,
              party_flip: String(row.party_flip).toLowerCase() === 'true',
              coalition_flip: String(row.coalition_flip).toLowerCase() === 'true',
              deletions_exceed_margin: String(row.deletions_exceed_margin).toLowerCase() === 'true',
              trailing_candidate_2026: row.trailing_candidate_2026,
              trailing_party_2026_standard: row.trailing_party_2026_standard || row.trailing_party_2026
            } as ElectionData;
          }
        });
        resolve(normalized);
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
};

export const PARTY_COLORS: Record<string, string> = {
  // WB Parties
  'AITC': '#28a745',
  'BJP': '#FF9933',
  'INC': '#195C9D',
  'CPI(M)': '#DE2B20',
  'ISF': '#1D4E89',
  'AJUP': '#8B4513',
  'GJM': '#FFD700',
  'BGPM': '#DAA520',
  // Kerala Parties
  'CPI': '#E32636',
  'IUML': '#006400',
  'KEC(M)': '#FFFF00',
  'JD(S)': '#008000',
  'NCP': '#00BFFF',
  'Others': '#808080'
};

export const COALITION_COLORS: Record<string, string> = {
  'LDF': '#DE2B20', // Red
  'UDF': '#195C9D', // Blue
  'NDA': '#FF9933', // Orange
  'Others': '#808080'
};

export const getPartyColor = (party: string) => PARTY_COLORS[party] || '#cccccc';
export const getCoalitionColor = (coalition: string) => COALITION_COLORS[coalition] || '#cccccc';
