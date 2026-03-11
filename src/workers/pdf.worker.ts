import { Worker, Job } from 'bullmq';
import { connection } from '../queues/pdf.queue';
import { generatePDFService } from '../services/pdf.service';
import { SSEService } from '../services/sse.service';

const worker = new Worker('pdf-tasks', async (job) => {
  const { apiKey, documentId } = job.data;
  const jobId = job.id;
  
  if (!jobId) {
    throw new Error('Job ID is undefined');
  }
  
  console.log(`🔄 Procesando job ${jobId} para documento ${documentId}`);
  
  try {
    // Notificar inicio
    await SSEService.publish(jobId, 'progreso', { 
      etapa: 'iniciado', 
      porcentaje: 10,
      mensaje: 'Comenzando generación del PDF...'
    });
    
    // Simular progreso (opcional, puedes quitarlo si no lo necesitas)
    await new Promise(resolve => setTimeout(resolve, 500));
    await SSEService.publish(jobId, 'progreso', { 
      etapa: 'generando HTML', 
      porcentaje: 30,
      mensaje: 'Procesando plantilla...'
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await SSEService.publish(jobId, 'progreso', { 
      etapa: 'generando PDF', 
      porcentaje: 60,
      mensaje: 'Generando documento PDF...'
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await SSEService.publish(jobId, 'progreso', { 
      etapa: 'guardando archivo', 
      porcentaje: 80,
      mensaje: 'Guardando archivo...'
    });

    // Generar PDF (tu servicio real)
    const result = await generatePDFService({ apiKey, documentId });
    
    console.log(`✅ PDF generado exitosamente para job ${jobId}, slug: ${result.slug}`);
    
    // Notificar completado
    await SSEService.publish(jobId, 'completado', {
      success: true,
      slug: result.slug,
      pdfBase64: result.pdfBase64, // Opcional: enviar el PDF directamente
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