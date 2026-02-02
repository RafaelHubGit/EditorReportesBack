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
  
      const result = await generatePDFService(apiKey, documentId);
  
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

    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message || 'Internal Server Error'
    });
  }


}

// export const generatePDF = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { documentId, data, options } = req.body as GeneratePDFRequest;

//     // Validación básica
//     if (!documentId || !data) {
//       const response: GeneratePDFResponse = {
//         success: false,
//         documentId: documentId || 'unknown',
//         timestamp: new Date().toISOString(),
//         error: 'Missing required fields: documentId and data are required'
//       };
//       res.status(400).json(response);
//       return;
//     }

//     // Obtener info de API Key del middleware
//     const apiKeyInfo = req.apiKeyInfo;

//     const document = await TemplateService.getTemplateById(documentId);

//     if (!document) {
//       const response: GeneratePDFResponse = {
//         success: false,
//         documentId: documentId || 'unknown',
//         timestamp: new Date().toISOString(),
//         error: 'Document not found'
//       };
//       res.status(404).json(response);
//       return;
//     }

//     console.log(`📄 PDF Generation Request:`, {
//       documentId,
//       environment: apiKeyInfo?.environment,
//       client: apiKeyInfo?.clientName,
//       timestamp: new Date().toISOString()
//     });

//     // Llamar al servicio de PDF (lo implementaremos después)
//     const result = await generatePDFService({
//       apiKey: apiKeyInfo?.key || 'unknown',
//       documentId,
//       data,
//       options,
//       environment: apiKeyInfo?.environment || 'development'
//     });

//     // Responder
//     const resp: GeneratePDFResponse = {
//       success: true,
//       pdfUrl: result.pdfUrl,
//       pdfBuffer: result.pdfBuffer,
//       documentId,
//       timestamp: new Date().toISOString(),
//       message: 'PDF generated successfully'
//     };

//     res.status(200).json(resp);

//   } catch (error: any) {
//     console.error('❌ PDF Generation Error:', error);

//     const response: GeneratePDFResponse = {
//       success: false,
//       documentId: req.body.documentId || 'unknown',
//       timestamp: new Date().toISOString(),
//       error: error.message || 'Unknown error during PDF generation'
//     };

//     res.status(500).json(response);
//   }
// };