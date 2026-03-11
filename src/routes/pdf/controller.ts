// src/routes/pdf/controller.ts
import { Request, Response } from 'express';
import { GeneratePDFResponse } from './types';
import fs from 'fs';

import { addPdfToQueue } from '../../queues/pdf.queue';
import { AppDataSource } from '../../config/typeorm.config';
import { FileStatus, GeneratedFile } from '../../entities/GeneratedFIles.entity';
import { StorageManager } from '../../manager/storage.manager';


export const generatePdfLink  = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey, documentId } = req.body;

    if (!apiKey || !documentId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: apiKey and documentId are required'
      });
      return;
    }

    console.log(`📥 Recibida solicitud para documento: ${documentId}`);


    // Encolar el trabajo
    const job = await addPdfToQueue({ apiKey, documentId });

    console.log(`✅ Trabajo encolado con ID: ${job.id}`);


    // Devolver jobId para que el cliente pueda conectarse al SSE
    res.status(202).json({
      success: true,
      jobId: job.id,
      status: 'queued',
      message: 'PDF generation started',
      // Incluimos la URL del SSE para que el cliente sepa dónde conectarse
      sseUrl: `/api/sse/pdf-status/${job.id}`
    });
    
  } catch (error: any) {
    console.error("❌ PDF Controller Error:", error.message);

    if (error.status === 429) {
      res.status(429).json({
        success: false,
        error: error.message,
        retryAfterSeconds: error.retryAfter
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
}


export const servePdfFile = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const fileRepository = AppDataSource.getRepository(GeneratedFile);

    if (!slug) {
        return res.status(400).json({ message: "Slug is required" });
    }

    try {
        // 1. Find the record
        const fileRecord = await fileRepository.findOne({ where: { slug } });

        if (!fileRecord) {
            return res.status(404).json({ message: "File not found" });
        }

        // 2. Check Expiration
        const now = new Date();
        if (now > fileRecord.expires_at || fileRecord.status === FileStatus.EXPIRED) {
            
            // Logic: Link expired, so we cleanup
            const storageProvider = StorageManager.getProvider();
            await storageProvider.delete(fileRecord.slug + '.pdf', 'pdf');
            
            // Update DB status
            fileRecord.status = FileStatus.EXPIRED;
            await fileRepository.save(fileRecord);

            return res.status(410).json({ message: "The file has already expired" });
        }

        // 3. Serve the file
        const storageProvider = StorageManager.getProvider();
        const filePath = await storageProvider.getSignedUrl(fileRecord.slug + '.pdf', 'pdf');

        // res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileRecord.original_name}"`);

        // If local, we stream directly. If GCS, we redirect or stream from the URL.
        if (process.env.PROJECT_MODE === 'local') {
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } else {
            // For SaaS/GCS, you can redirect to the signed URL
            res.redirect(filePath);
        }

        // 4. Handle "Delete Immediately" logic
        if (fileRecord.delete_immediately) {
            // We should wait for the stream to finish before deleting
            res.on('finish', async () => {
                await storageProvider.delete(fileRecord.slug + '.pdf', 'pdf');
                fileRecord.status = FileStatus.EXPIRED;
                await fileRepository.save(fileRecord);
            });
        }

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



// export const generateLinkPdf = async (req: Request, res: Response): Promise<void> => {

//   try {
  
//       // Get apiKey from request body (POST data)
//       const { apiKey, documentId } = req.body;
  
//       if (!apiKey || !documentId) {
//         const response: GeneratePDFResponse = {
//           success: false,
//           documentId: 'unknown',
//           timestamp: new Date().toISOString(),
//           error: 'Missing required fields: apiKey and documentId are required'
//         };
//         res.status(400).json(response);
//         return;
//       }
  
//       const result = await generatePDFService({apiKey, documentId});
  
//       const response: GeneratePDFResponse = {
//         success: result.success,
//         timestamp: new Date().toISOString(),
//         message: result.message,
//         pdfBase64: result.pdfBase64
//       };
  
//       res.status(200).json(response);
    
//   } catch (error: any) {
//     // This catches the "Failed to generate PDF" error from your service
//     console.error("❌ PDF Controller Error:", error.message);

//     //Manejo específico para Rate Limit (429)
//     if (error.status === 429) {
//       if (error.retryAfter) {
//         res.set('Retry-After', String(error.retryAfter));
//       }
      
//       res.status(429).json({
//         success: false,
//         timestamp: new Date().toISOString(),
//         error: error.message,
//         retryAfterSeconds: error.retryAfter
//       });
//       return;
//     }

//     res.status(500).json({
//       success: false,
//       timestamp: new Date().toISOString(),
//       error: error.message || 'Internal Server Error'
//     });
//   }


// }

