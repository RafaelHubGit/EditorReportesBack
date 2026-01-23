// src/routes/pdf/index.ts
import { Router } from 'express';
// import { validateApiKey } from './middleware';
import { generatePDF } from './controller';

const router = Router();

// POST /api/pdf/generate
// router.post('/generate', validateApiKey, generatePDF);
router.post('/generatePdf', generatePDF);

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