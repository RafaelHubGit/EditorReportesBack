// src/routes/pdf/controller.ts
import { Request, Response } from 'express';
import { GeneratePDFRequest, GeneratePDFResponse } from './types';

import { TemplateService } from '../../services/template.service';
import { generatePDFService } from '../../services/pdf.service';


export const generatePDF = async (req: Request, res: Response): Promise<void> => {

  try {
  
      // Get apiKey from request body (POST data)
      const { apiKey, documentId } = req.body;
  
      if (!apiKey || !documentId) {
        const response: GeneratePDFResponse = {
          success: false,
          documentId: 'unknown',
          timestamp: new Date().toISOString(),
          error: 'Missing required fields: apiKey and documentId are required'
        };
        res.status(400).json(response);
        return;
      }
  
      const result = await generatePDFService({apiKey, documentId});
  
      const response: GeneratePDFResponse = {
        success: result.success,
        timestamp: new Date().toISOString(),
        message: result.message,
        pdfBase64: result.pdfBase64
      };
  
      res.status(200).json(response);
    
  } catch (error: any) {
    // This catches the "Failed to generate PDF" error from your service
    console.error("❌ PDF Controller Error:", error.message);

    //Manejo específico para Rate Limit (429)
    if (error.status === 429) {
      if (error.retryAfter) {
        res.set('Retry-After', String(error.retryAfter));
      }
      
      res.status(429).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        retryAfterSeconds: error.retryAfter
      });
      return;
    }

    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message || 'Internal Server Error'
    });
  }


}
