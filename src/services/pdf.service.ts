
import { GeneratePDFDto, PdfOptionsDto, PdfOptionsDtoSchema } from "../dto/pdf-generation.dto";
import { generateHtml } from "../utils/generateHtml";
import { SecurityService } from "../utils/security";
import { ApiKeyService } from "./apiKey.service";
import { RateLimitService } from "./rateLimit.service";
import { TemplateService } from "./template.service";




// export const generatePDFService = async ( apikey: string, documentId: string ): 
export const generatePDFService = async ( payload: IGeneratePDFService, jsonDataVar?: Record<string, any> ): Promise<{ 
        success: boolean, 
        pdfBase64: string, 
        message: string 
}> => {

    const { apiKey, documentId } = payload;

    // Validar API Key
    const apiKeyValidated = await ApiKeyService.validateApiKey(apiKey);
    if (!apiKeyValidated) {
        throw new Error('Invalid API key');
    }

    // Usamos el ID de la API Key o la llave misma como identificador único
    const LIMIT_PER_HOUR = Number(process.env.PDF_LIMIT_PER_HOUR) || 500;
    const ONE_HOUR_MS = 60 * 60 * 1000;

    const rateLimit = RateLimitService.checkAndIncrement(
        apiKey, 
        LIMIT_PER_HOUR, 
        ONE_HOUR_MS
    );

    if (!rateLimit.allowed) {
        // Lanzamos un error específico que tu controlador pueda atrapar
        // para devolver el status 429
        const error: any = new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
        error.status = 429;
        error.retryAfter = rateLimit.retryAfter;
        throw error;
    }

    // Validar Documento
    const document = await TemplateService.getTemplateById(documentId);
    console.log('🔵 Documento encontrado:', document);
    if (!document) {
        throw new Error('Document not found');
    }

    const cleanBodyHtml = SecurityService.sanitizeContent(document.html);
    // Sanitizamos Header y Footer si vienen en las opciones
    if (document.htmlHeader) {
        document.htmlHeader = SecurityService.sanitizeContent(document.htmlHeader);
    }
    if (document.htmlFooter) {
        document.htmlFooter = SecurityService.sanitizeContent(document.htmlFooter);
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
        json: jsonDataVar || document.sampleData,
        headerCss: document.cssHeader,
        footerCss: document.cssFooter
    });

    const vpageConfig = PdfOptionsDtoSchema.parse(document.pageConfig);

    // Agregar header y footer si existen
    if (document.htmlHeader || document.htmlFooter) {
        vpageConfig.displayHeaderFooter = true;
        
        if (document.htmlHeader) {
            vpageConfig.headerTemplate = document.htmlHeader;
        }
        
        if (document.htmlFooter) {
            vpageConfig.footerTemplate = document.htmlFooter;
        }
    }



    const pdfBase64 = await callPdfApi(renderedHtml, vpageConfig);

    

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

        let fetchResponse: Response;

        fetchResponse = await fetch('http://localhost:3001/api/pdf/base64', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                html: html,
                pdfOptions: options 
            }),
            signal: controller.signal
        });
        
        
        if (!fetchResponse.ok) {
            throw new Error(`Failed to generate PDF: ${fetchResponse.status} - ${JSON.stringify(fetchResponse)}`);
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