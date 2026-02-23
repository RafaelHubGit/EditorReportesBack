export interface PdfMarginDto {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
}

export interface PdfOptionsDto {
  format?: string;
  unit?: "mm" | "cm" | "in" | "px";
  width?: string | number;
  height?: string | number;
  landscape?: boolean;
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
  pageRanges?: string;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  margin?: PdfMarginDto;
}

export interface GeneratePDFDto {
  apiKey: string;
  documentId: string;
  data: Record<string, any>;
  pdfOptions?: PdfOptionsDto;
}