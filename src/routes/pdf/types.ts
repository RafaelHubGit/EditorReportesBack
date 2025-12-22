// src/routes/pdf/types.ts
export interface GeneratePDFRequest {
  // apiKey: string;
  documentId: string;
  data: Record<string, any>; // JSON dinámico
  options?: {
    format?: 'A4' | 'Letter';
    quality?: 'low' | 'medium' | 'high';
    download?: boolean;
  };
}

export interface GeneratePDFResponse {
  success: boolean;
  pdfUrl?: string | undefined;
  pdfBuffer?: string | undefined; // Base64 si prefieres
  documentId: string;
  timestamp: string;
  message?: string | undefined;
  error?: string | undefined;
}

export interface ApiKeyInfo {
  key: string;
  environment: 'development' | 'production';
  clientName?: string;
  rateLimit?: number;
  isValid: boolean;
}