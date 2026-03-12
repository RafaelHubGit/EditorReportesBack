

interface IGeneratePDFService {
    apiKey: string;
    documentId: string;
    webhookUrl?: string;
    webhookMethod?: 'POST' | 'PUT';
}