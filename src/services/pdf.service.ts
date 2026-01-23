
import { generateHtml } from "../utils/generateHtml";
import { ApiKeyService } from "./apiKey.service";
import { TemplateService } from "./template.service";




export const generatePDFService = async ( apikey: string, documentId: string ): 
    Promise<{ 
        success: boolean, 
        pdfBase64: string, 
        message: string 
}> => {
    
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

    const pdfBase64 = await callPdfApi(renderedHtml);

    return {
        success: true,
        pdfBase64,
        message: 'PDF generated successfully'
    };
}

const callPdfApi = async ( html: string ): Promise<string> => {

    const fetchResponse = await fetch('http://localhost:3001/api/pdf/base64', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            html: html
        })
    })
    
    if (!fetchResponse.ok) {
        throw new Error('Failed to generate PDF');
    }

    const response = await fetchResponse.json() as { pdfBase64: string };

    return response.pdfBase64;

}