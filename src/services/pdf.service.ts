
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
    let css = document.css;
    const data = document.sampleData;

    // Watermark Injection Logic
    if (apiKeyValidated.type === "development") {
        console.log("Watermark Injection Logic");
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
        css += watermarkCss;
    }

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