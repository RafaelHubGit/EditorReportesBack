// src/routes/pdf/service.ts
import { GeneratePDFRequest } from './types';
import dotenv from 'dotenv';

dotenv.config();

interface PDFServiceResult {
  pdfUrl?: string;
  pdfBuffer?: string;
  fileName: string;
}

export const generatePDFService = async (params: {
  apiKey: string;
  documentId: string;
  data: Record<string, any>;
  options?: any;
  environment: 'development' | 'production';
}): Promise<PDFServiceResult> => {

  const pdfUri: string = process.env.PDF_URI || 'http://localhost:3000';


  console.log('🔄 Calling PDF Service with:', {
    documentId: params.documentId,
    environment: params.environment
  });

  // TEMPORAL: Esto es donde integrarás tu servicio existente de PDF
  // Por ahora devolvemos un mock

  // Ejemplo de integración con servicio existente:
  // const yourExistingPDFService = require('../services/your-pdf-service');
  // const pdfBuffer = await yourExistingPDFService.generate(params.documentId, params.data);

  // Para pruebas, creamos un resultado simulado
  const mockPdfBuffer = 'JVBERi0xLjcKJc...'; // Base64 mock

  return {
    pdfUrl: `${pdfUri}/${params.documentId}-${Date.now()}.pdf`,
    pdfBuffer: mockPdfBuffer,
    fileName: `${params.documentId}-${Date.now()}.pdf`
  };
};