// generateHtml.ts
import Handlebars from 'handlebars';
import { setupHandlebarsHelpers } from '../helpers/handlebars.helpers';

export interface GenerateHtmlOptions {
  html: string;
  css: string;
  json: Record<string, any>;
}

export const generateHtml = ({ html, css, json }: GenerateHtmlOptions): string => {
  try {
    // 1. Configurar los helpers de Handlebars
    setupHandlebarsHelpers();

    // 2. Preparar los datos JSON (añadir campos calculados)
    const preparedData = prepareData(json);

    // 3. Combinar HTML con CSS
    const fullHtml = combineHtmlWithCss(html, css);

    // 4. Compilar y renderizar el template
    const template = Handlebars.compile(fullHtml);
    const renderedHtml = template(preparedData);

    return renderedHtml;
  } catch (error) {
    console.error('❌ Error generando HTML:', error);
    throw new Error(`Error al generar HTML: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

const prepareData = (jsonData: Record<string, any>): Record<string, any> => {
  const data = { ...jsonData };

  // Calcular taxRatePercentage si existe taxRate
  if (data.taxRate !== undefined) {
    data.taxRatePercentage = data.taxRate * 100;
  }

  // Calcular lineTotal para cada item si no existe
  if (data.items && Array.isArray(data.items)) {
    data.items = data.items.map((item: any) => ({
      ...item,
      lineTotal: item.lineTotal || (item.quantity * item.unitPrice)
    }));
  }

  // Formatear campos monetarios si se necesita
  if (!data.currencyFormat) {
    data.currencyFormat = (amount: number) => 
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: data.currencyCode || 'MXN'
      }).format(amount || 0);
  }

  return data;
};

const combineHtmlWithCss = (html: string, css: string): string => {
  // Buscar la posición de </head> o <head> en el HTML
  const headEndIndex = html.indexOf('</head>');
  
  if (headEndIndex !== -1) {
    // Insertar CSS antes del cierre de </head>
    return html.slice(0, headEndIndex) + 
           `<style>${css}</style>` + 
           html.slice(headEndIndex);
  } else {
    // Si no hay <head>, crear uno básico
    const htmlStartIndex = html.indexOf('<html');
    if (htmlStartIndex !== -1) {
      const headStartIndex = html.indexOf('>', htmlStartIndex) + 1;
      return html.slice(0, headStartIndex) + 
             `<head><style>${css}</style></head>` + 
             html.slice(headStartIndex);
    } else {
      // Si no hay estructura HTML, envolver en HTML básico
      return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`;
    }
  }
};