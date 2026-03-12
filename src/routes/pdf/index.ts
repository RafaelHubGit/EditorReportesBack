// src/routes/pdf/index.ts
import { Router } from 'express';
// import { validateApiKey } from './middleware';
import { servePdfFile, generatePdfLink, generatePdfWebhook } from './controller';

const router = Router();

router.post('/generatePdf', generatePdfLink ); //encola y responde con jobId (flujo SSE)
router.post('/generatePdfWebhook', generatePdfWebhook ); //encola y responde con PDF
router.get('/v/:slug', servePdfFile); //sirve el PDF

// GET /api/pdf/templates (opcional, para listar templates disponibles)
// router.get('/templates', validateApiKey, (req, res) => {
//   res.json({
//     success: true,
//     templates: [
//       { id: 'invoice', name: 'Invoice Template', description: 'Standard invoice' },
//       { id: 'report', name: 'Report Template', description: 'Monthly report' },
//       // Agrega más templates según necesites
//     ]
//   });
// });

export default router;