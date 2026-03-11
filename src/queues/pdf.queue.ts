// src/queues/pdf.queue.ts
import { Queue, Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

export type PDFJobData = {
  apiKey: string;
  documentId: string;
};

// Exportamos la conexión para reusarla
export const connection = { host: 'localhost', port: 6379 };

export const pdfQueue = new Queue('pdf-tasks', { connection });

export const addPdfToQueue = async (data: PDFJobData): Promise<Job<PDFJobData>> => {

  const customJobId = uuidv4();

  return await pdfQueue.add('generate-pdf', data, {
    jobId: customJobId,
    attempts: Number(process.env.QUEUE_ATTEMPTS) || 3,
    backoff: { 
      type: 'exponential', 
      delay: Number(process.env.QUEUE_DELAY) || 5000 
    },
    removeOnComplete: true
  });
};