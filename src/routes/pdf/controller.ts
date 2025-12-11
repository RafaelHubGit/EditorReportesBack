// src/routes/pdf/controller.ts
import { Request, Response } from 'express';
import { GeneratePDFRequest, GeneratePDFResponse } from './types';
import { generatePDFService } from './service';

export const generatePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId, data, options } = req.body as GeneratePDFRequest;
    
    // Validación básica
    if (!documentId || !data) {
      const response: GeneratePDFResponse = {
        success: false,
        documentId: documentId || 'unknown',
        timestamp: new Date().toISOString(),
        error: 'Missing required fields: documentId and data are required'
      };
      res.status(400).json(response);
      return;
    }
    
    // Obtener info de API Key del middleware
    const apiKeyInfo = req.apiKeyInfo;
    
    console.log(`📄 PDF Generation Request:`, {
      documentId,
      environment: apiKeyInfo?.environment,
      client: apiKeyInfo?.clientName,
      timestamp: new Date().toISOString()
    });
    
    // Llamar al servicio de PDF (lo implementaremos después)
    const result = await generatePDFService({
      apiKey: apiKeyInfo?.key || 'unknown',
      documentId,
      data,
      options,
      environment: apiKeyInfo?.environment || 'development'
    });
    
    // Responder
    const resp: GeneratePDFResponse = {
      success: true,
      pdfUrl: result.pdfUrl,
      pdfBuffer: result.pdfBuffer,
      documentId,
      timestamp: new Date().toISOString(),
      message: 'PDF generated successfully'
    };
    
    res.status(200).json(resp);
    
  } catch (error: any) {
    console.error('❌ PDF Generation Error:', error);
    
    const response: GeneratePDFResponse = {
      success: false,
      documentId: req.body.documentId || 'unknown',
      timestamp: new Date().toISOString(),
      error: error.message || 'Unknown error during PDF generation'
    };
    
    res.status(500).json(response);
  }
};