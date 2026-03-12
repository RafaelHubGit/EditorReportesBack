// src/routes/pdf/controller.ts
import { Request, Response } from 'express';
import { GeneratePDFResponse } from './types';
import fs from 'fs';

import { addPdfToQueue } from '../../queues/pdf.queue';
import { AppDataSource } from '../../config/typeorm.config';
import { FileStatus, GeneratedFile } from '../../entities/GeneratedFIles.entity';
import { StorageManager } from '../../manager/storage.manager';
import { handlePdfEnqueue } from './shared.handler';


export const generatePdfLink  = async (req: Request, res: Response) => {
  return handlePdfEnqueue(req, res, { responseType: 'sse' });
}

export const generatePdfWebhook = async (req: Request, res: Response) => {
  return handlePdfEnqueue(req, res, { responseType: 'webhook' });
};



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
            
            // Solo eliminar si no está ya eliminado
            if (fileRecord.status !== FileStatus.EXPIRED) {
                const storageProvider = StorageManager.getProvider();
                await storageProvider.delete(fileRecord.slug + '.pdf', 'pdf');
                
                // Update DB status
                fileRecord.status = FileStatus.EXPIRED;
                await fileRepository.save(fileRecord);
            }

            return res.status(410).json({ message: "The file has already expired" });
        }

        // 3. Serve the file
        const storageProvider = StorageManager.getProvider();
        const filePath = await storageProvider.getSignedUrl(fileRecord.slug + '.pdf', 'pdf');

        res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `inline; filename="${fileRecord.original_name}"`);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileRecord.original_name)}"`);
        
        // Prevenir caché
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // 4. Handle "Delete Immediately" logic - MODIFICADO
        if (fileRecord.delete_immediately) {
            // Programar eliminación después de 30 segundos
            setTimeout(async () => {
                try {
                    // Verificar si el archivo ya fue eliminado
                    const currentRecord = await fileRepository.findOne({ where: { slug } });
                    if (currentRecord && currentRecord.status !== FileStatus.EXPIRED) {
                        const storageProvider = StorageManager.getProvider();
                        await storageProvider.delete(fileRecord.slug + '.pdf', 'pdf');
                        
                        currentRecord.status = FileStatus.EXPIRED;
                        currentRecord.delete_immediately = false;
                        await fileRepository.save(currentRecord);
                        console.log(`🗑️ Physical file ${fileRecord.slug} deleted after delay.`);
                    }
                } catch (e) {
                    console.error("Cleanup error:", e);
                }
            }, 30000); // 30 segundos
            
            // No marcar como EXPIRADO inmediatamente
            fileRecord.delete_immediately = false;
            await fileRepository.save(fileRecord);
        }

        // 5. Stream o redirigir el archivo
        if (process.env.PROJECT_MODE === 'local') {
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } else {
            res.redirect(filePath);
        }

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


