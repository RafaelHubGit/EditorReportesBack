import { Worker, Job } from 'bullmq';
import { connection } from '../queues/pdf.queue';
import { generatePDFService } from '../services/pdf.service';

type NotifyCallback = (event: string, data: any) => void;

// Necesitamos una forma de notificar el progreso
// Por ahora usaremos un mapa en memoria (luego mejoraremos esto)
export const activeJobs = new Map<string, NotifyCallback>();

const worker = new Worker('pdf-tasks', async (job) => {
  const { apiKey, documentId } = job.data;
  const jobId = job.id; // job.id es string | undefined
  
  // Si no hay jobId, algo está mal
  if (!jobId) {
    throw new Error('Job ID is undefined');
  }
  
  console.log(`🔄 Procesando job ${jobId}`);
  
  try {
    // Notificar inicio
    const notificar = activeJobs.get(jobId);
    if (notificar) notificar('progreso', { etapa: 'iniciado', porcentaje: 10 });

    // Llamar a tu servicio existente
    const result = await generatePDFService({ apiKey, documentId });
    
    // Notificar completado
    if (notificar) {
      notificar('completado', {
        success: true,
        pdfBase64: result.pdfBase64,
        message: result.message
      });
    }
    
    return result;
    
  } catch (error: any) {
    console.error(`❌ Error en job ${jobId}:`, error);
    
    // Notificar error
    const notificar = activeJobs.get(jobId);
    if (notificar) {
      notificar('error', {
        message: error.message,
        status: error.status || 500
      });
    }
    
    throw error;
  } finally {
    // Limpiar siempre
    activeJobs.delete(jobId);
  }
}, { 
  connection,
  lockDuration: Number(process.env.QUEUE_DURATION) || 60000,
  concurrency: Number(process.env.QUEUE_CONCURRENCY) || 5, // Procesar 5 PDFs simultáneamente
  lockRenewTime: Number(process.env.QUEUE_LOCK_RENEW_TIME) || 15000, // It will renew the lock every 15 seconds automatically
});

worker.on('completed', (job: Job) => {
  console.log(`✅ Job ${job.id} completado`);
});

worker.on('failed', (job: Job | undefined, error: Error) => {
  console.log(`❌ Job ${job?.id} falló:`, error.message);
});

console.log('🚀 Worker de PDF iniciado');

export default worker;