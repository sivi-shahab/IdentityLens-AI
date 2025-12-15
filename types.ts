export interface Identity {
  id: string;
  name: string;
  avatarUrl: string; // Base64 or Object URL
  createdAt: number;
}

export interface AnalyzedPhoto {
  id: string;
  url: string; // Base64 or Object URL
  matchedIdentityId: string | null; // null if unknown
  confidence: number;
  timestamp: number;
  status: 'pending' | 'analyzed' | 'error';
}

export interface AnalysisResult {
  matchedIdentityId: string | null;
  confidence: number;
}

export type ViewState = 'dashboard' | 'identities' | 'scan';