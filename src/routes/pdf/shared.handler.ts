// src/routes/pdf/shared.handler.ts
import { Request, Response } from 'express';
import { addPdfToQueue } from '../../queues/pdf.queue';

export const handlePdfEnqueue = async (req: Request, res: Response, options: {
  responseType: 'sse' | 'webhook' 
}) => {
  const { apiKey, documentId, deleteImmediately = false, webhookUrl } = req.body;

  // 1. Common Validation
  if (!apiKey || !documentId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: apiKey and documentId are required'
    });
  }

  // 2. SSRF Protection: Basic URL validation for webhooks
  if (options.responseType === 'webhook' && !webhookUrl) {
    return res.status(400).json({ success: false, error: 'webhookUrl is required for this endpoint' });
  }

  try {
    const job = await addPdfToQueue({ 
      apiKey, 
      documentId,
      deleteImmediately,
      webhookUrl // This will be undefined for SSE calls, which is fine
    });

    const responsePayload: any = {
      success: true,
      jobId: job.id,
      status: 'queued',
      message: `PDF generation started)`,
    };

    // Add specific fields based on the type
    if (options.responseType === 'sse') {
      responsePayload.sseUrl = `/api/sse/pdf-status/${job.id}`;
    }

    return res.status(202).json(responsePayload);
    
  } catch (error: any) {
    console.error("❌ Enqueue Error:", error.message);
    const status = error.status === 429 ? 429 : 500;
    return res.status(status).json({ success: false, error: error.message });
  }
};