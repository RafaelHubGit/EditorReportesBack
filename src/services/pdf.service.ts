
import { generateHtml } from "../utils/generateHtml";
import { ApiKeyService } from "./apiKey.service";
import { TemplateService } from "./template.service";




export const generatePDFService = async ( apikey: string, documentId: string ): Promise<void> => {
    
    const apiKeyValidated = await ApiKeyService.validateApiKey(apikey);

    if (!apiKeyValidated) {
        throw new Error('Invalid API key');
    }
    const document = await TemplateService.getTemplateById(documentId);

    if (!document) {
        throw new Error('Document not found');
    }

    const html = document.html;
    const css = document.css;
    const data = document.sampleData;

    const renderedHtml = generateHtml({ html, css, json: data });

    console.log("RENDER HTML : ", renderedHtml);

    // const pdfBuffer = await htmlToPdf(renderedHtml);

    // const pdfUrl = await uploadToS3(pdfBuffer);

    // return {
    //     success: true,
    //     pdfUrl,
    //     pdfBuffer,
    //     documentId,
    //     timestamp: new Date().toISOString(),
    //     message: 'PDF generated successfully'
    // };
}