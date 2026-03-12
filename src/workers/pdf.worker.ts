import { Worker, Job } from 'bullmq';
import crypto from 'node:crypto';
import { connection } from '../queues/pdf.queue';
import { generatePDFDirectService, generatePDFService } from '../services/pdf.service';
import { SSEService } from '../services/sse.service';
import { PDFJobData } from '../types/pdfJob';

const worker = new Worker('pdf-tasks', async (job: Job<PDFJobData>) => {
  const { apiKey, documentId, deleteImmediately = false, webhookUrl } = job.data;
  const jobId = job.id;
  
  if (!jobId) {
    throw new Error('Job ID is undefined');
  }
  
  console.log(`🔄 Procesando job ${jobId} para documento ${documentId} (deleteImmediately: ${deleteImmediately})`);
  
  try {
    // Notificar inicio
    await SSEService.publish(jobId, 'progreso', { 
      etapa: 'iniciado', 
      porcentaje: 10,
      mensaje: 'Comenzando generación del PDF...'
    });
    
    // Función de progreso común para ambos servicios
    const reportProgress = async (etapa: string, porcentaje: number, mensaje: string) => {
      await SSEService.publish(jobId, 'progreso', { etapa, porcentaje, mensaje });
    };

    let result;

    result = await generatePDFService(
      { apiKey, documentId },
      reportProgress,
      undefined,
      deleteImmediately
    );

    if (webhookUrl) {
      const payload = {
        event: 'pdf.completed',
        jobId,
        slug: result.slug,
        url: `http://localhost:4000/api/pdf/v/${result.slug}`,
        timestamp: new Date().toISOString()
      };

      // SIGN THE PAYLOAD (Security)
      const secret = process.env.WEBHOOK_SECRET || 'fallback_secret';
      const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-SaaS-Signature': signature // Client validates this
        },
        body: JSON.stringify(payload),
      });
    }
    
    console.log(`✅ PDF generado exitosamente para job ${jobId}, slug: ${result.slug}`);
    
    // Notificar completado con slug/url
    await SSEService.publish(jobId, 'completado', {
      success: true,
      slug: result.slug,
      url: `http://localhost:4000/api/pdf/v/${result.slug}`,
      message: 'PDF generado correctamente'
    });
    
    return result;
    
  } catch (error: any) {
    console.error(`❌ Error en job ${jobId}:`, error);
    
    // Notificar error
    await SSEService.publish(jobId, 'error', {
      success: false,
      message: error.message || 'Error generando PDF',
      status: error.status || 500
    });
    
    throw error;
  }
}, { 
  connection,
  lockDuration: Number(process.env.QUEUE_DURATION) || 60000,
  concurrency: Number(process.env.QUEUE_CONCURRENCY) || 5,
  lockRenewTime: Number(process.env.QUEUE_LOCK_RENEW_TIME) || 15000,
});

worker.on('completed', (job: Job) => {
  console.log(`✅ Worker: Job ${job.id} completado`);
});

worker.on('failed', (job: Job | undefined, error: Error) => {
  console.log(`❌ Worker: Job ${job?.id} falló:`, error.message);
});

console.log('🚀 Worker de PDF iniciado con Redis Pub/Sub');

export default worker;