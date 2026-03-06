import { Router, Request, Response } from 'express';
import { activeJobs } from '../../workers/pdf.worker';

const router = Router();

// Mapa para llevar control de las conexiones activas
const sseConnections = new Map<string, Response>();

router.get('/pdf-status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  // Validar que jobId existe
  if (!jobId) {
    res.status(400).json({ error: 'jobId is required' });
    return;
  }
  
  console.log(`📡 Cliente conectado para job ${jobId}`);
  
  // Configurar headers SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*' // Ajusta según tu necesidad
  });
  
  // Enviar heartbeat cada 15 segundos para mantener viva la conexión
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);
  
  // Guardar la conexión para que el worker pueda usarla
  sseConnections.set(jobId, res);
  
  // Registrar función de notificación en activeJobs
  activeJobs.set(jobId, (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    
    // Si el evento es 'completado' o 'error', podemos cerrar la conexión
    if (event === 'completado' || event === 'error') {
      setTimeout(() => {
        res.end();
        sseConnections.delete(jobId);
      }, 1000);
    }
  });
  
  // Manejar desconexión del cliente
  req.on('close', () => {
    console.log(`🔌 Cliente desconectado de job ${jobId}`);
    clearInterval(heartbeat);
    sseConnections.delete(jobId);
    activeJobs.delete(jobId);
  });
});

export default router;