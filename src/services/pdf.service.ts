
import { AppDataSource } from "../config/typeorm.config";
import { GeneratePDFDto, PdfOptionsDto, PdfOptionsDtoSchema } from "../dto/pdf-generation.dto";
import { FileStatus, GeneratedFile } from "../entities/GeneratedFIles.entity";
import { StorageManager } from "../manager/storage.manager";
import { generateSecureSlug } from "../utils/file.util";
import { generateHtml } from "../utils/generateHtml";
import { SecurityService } from "../utils/security";
import { ApiKeyService } from "./apiKey.service";
import { RateLimitService } from "./rateLimit.service";
import { SSEService } from "./sse.service";
import { TemplateService } from "./template.service";


type ProgressCallback = (etapa: string, porcentaje: number, mensaje: string) => Promise<void>;

// export const generatePDFService = async ( apikey: string, documentId: string ): 
export const generatePDFService = async ( 
    payload: IGeneratePDFService, 
    onProgress: ProgressCallback,
    jsonDataVar?: Record<string, any>,
): Promise<{ 
    success: boolean, 
    pdfBase64: string, 
    slug: string, // New: Return the slug
    message: string
}> => {

    const { apiKey, documentId } = payload;

    await onProgress('validando API key', 10, 'Verificando credenciales...');

    // Validar API Key
    const apiKeyValidated = await ApiKeyService.validateApiKey(apiKey);
    if (!apiKeyValidated) {
        throw new Error('Invalid API key');
    }

    await onProgress('API validada', 20, 'Apy Key verificada correctamente');

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

    await onProgress('rate limit ok', 30, 'Límite de uso verificado');


    // Validar Documento
    const document = await TemplateService.getTemplateById(documentId);

    if (!document) {
        throw new Error('Document not found');
    }

    await onProgress('documento cargado', 40, 'Documento encontrado');
    

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

    await onProgress('generando HTML', 50, 'Procesando plantilla...');

    
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

    await onProgress('generando PDF', 70, 'Llamando al servicio de PDF...');



    const pdfBuffer = await callPdfApi(renderedHtml, vpageConfig);

    await onProgress('guardando archivo', 85, 'Almacenando PDF...');

    // 1. Prepare Metadata
    const slug = generateSecureSlug(12);
    const fileName = `${slug}.pdf`;
    const storageProvider = StorageManager.getProvider();

    // 2. Save Physical File
    const storagePath = await storageProvider.save(pdfBuffer, fileName, 'pdf');

    // 3. Save to Database
    const fileRepository = AppDataSource.getRepository(GeneratedFile);
    const newFile = fileRepository.create({
        slug,
        original_name: document.name || 'document.pdf', // Using name from your document object
        storage_path: storagePath,
        status: FileStatus.COMPLETED,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24h
        delete_immediately: false // Or true if you want it one-time use
    });

    await fileRepository.save(newFile);

    return {
        success: true,
        pdfBase64: pdfBuffer.toString('base64'),
        slug, // Give this back so the controller knows the URL
        message: 'PDF generated and stored successfully'
    };
}

const callPdfApi = async ( html: string, options?: PdfOptionsDto ): Promise<Buffer> => {

    // 1. Crear un controlador para abortar la petición
    const controller = new AbortController();

    // 2. Configurar un timeout de 30 segundos
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {

        let fetchResponse: Response;

        // fetchResponse = await fetch('http://localhost:3001/api/pdf/base64', {
        fetchResponse = await fetch('http://localhost:3001/api/pdf/file', {
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


        const arrayBuffer = await fetchResponse.arrayBuffer();
        return Buffer.from(arrayBuffer);
        // const response = await fetchResponse.json() as { pdfBase64: string };
        // return response.pdfBase64;


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