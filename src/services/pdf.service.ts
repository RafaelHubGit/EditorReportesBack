
import { GeneratePDFDto, PdfOptionsDto } from "../dto/pdf-generation.dto";
import { generateHtml } from "../utils/generateHtml";
import { SecurityService } from "../utils/security";
import { ApiKeyService } from "./apiKey.service";
import { TemplateService } from "./template.service";




// export const generatePDFService = async ( apikey: string, documentId: string ): 
export const generatePDFService = async ( payload: GeneratePDFDto ): Promise<{ 
        success: boolean, 
        pdfBase64: string, 
        message: string 
}> => {

    const { apiKey, documentId, data, pdfOptions } = payload;

    const apiKeyValidated = await ApiKeyService.validateApiKey(apiKey);

    if (!apiKeyValidated) {
        throw new Error('Invalid API key');
    }
    const document = await TemplateService.getTemplateById(documentId);

    if (!document) {
        throw new Error('Document not found');
    }

    const cleanBodyHtml = SecurityService.sanitizeContent(document.html);
    // Sanitizamos Header y Footer si vienen en las opciones
    if (pdfOptions?.headerTemplate) {
        pdfOptions.headerTemplate = SecurityService.sanitizeContent(pdfOptions.headerTemplate);
    }
    if (pdfOptions?.footerTemplate) {
        pdfOptions.footerTemplate = SecurityService.sanitizeContent(pdfOptions.footerTemplate);
    }
    // let css = document.css;
    // const data = document.sampleData;

    // Watermark Injection Logic
    if (apiKeyValidated.type === "development") {
        
        const watermarkCss = `
            body::before {
                content: "DEVELOPMENT";
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 100px;
                color: rgba(200, 200, 200, 0.3);
                z-index: 9999;
                pointer-events: none;
                white-space: nowrap;
                font-family: sans-serif;
                font-weight: bold;
            }
        `;
        document.css += watermarkCss;
    }


    
    const renderedHtml = generateHtml({ 
        html: cleanBodyHtml, 
        css: document.css, 
        json: data 
    });

    

    const pdfBase64 = await callPdfApi(renderedHtml, pdfOptions);

    

    return {
        success: true,
        pdfBase64,
        message: 'PDF generated successfully'
    };
}

const callPdfApi = async ( html: string, options?: PdfOptionsDto ): Promise<string> => {

    // 1. Crear un controlador para abortar la petición
    const controller = new AbortController();

    // 2. Configurar un timeout de 30 segundos
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {

        const fetchResponse = await fetch('http://localhost:3001/api/pdf/base64', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                html: html,
                pdfOptions: options 
            }),
            signal: controller.signal
        })
        
        if (!fetchResponse.ok) {
            throw new Error('Failed to generate PDF');
        }

        const response = await fetchResponse.json() as { pdfBase64: string };

        return response.pdfBase64;


    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('PDF generation timed out after 30 seconds');
        }
        throw error;
    } finally {
        // 3. Limpiar el temporizador siempre
        clearTimeout(timeout);
    }
    

}