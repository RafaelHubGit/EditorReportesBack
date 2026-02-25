
// dto/pdf-generation.dto.ts
import { z } from "zod";


// Reutilizamos el schema de PDF options que ya tienes
const Units = ["mm", "cm", "in", "px"] as const;

export const PdfOptionsDtoSchema = z.object({
    format: z.string().optional(),
    unit: z.enum(Units).default("mm").optional(),
    width: z.union([z.string(), z.number()]).optional(),
    height: z.union([z.string(), z.number()]).optional(),
    landscape: z.boolean().optional(),
    printBackground: z.boolean().optional(),
    preferCSSPageSize: z.boolean().optional(),
    pageRanges: z.string().optional(),
    displayHeaderFooter: z.boolean().optional(),
    headerTemplate: z.string().optional(),
    footerTemplate: z.string().optional(),
    margin: z.object({
        top: z.union([z.string(), z.number()]).optional(),
        right: z.union([z.string(), z.number()]).optional(),
        bottom: z.union([z.string(), z.number()]).optional(),
        left: z.union([z.string(), z.number()]).optional(),
    }).partial().optional(),
});
// .partial().superRefine((data, ctx) => {
//     if (data.format && (data.width || data.height)) {
//         ctx.addIssue({
//             code: "custom",
//             message: "No puedes especificar 'format' y dimensiones ('width'/'height') al mismo tiempo.",
//             path: ["pdfOptions"],
//         });
//     }
// }
// );

// DTO principal para generar PDF
export const GeneratePDFDtoSchema = z.object({
    html: z.string(),
    pdfOptions: PdfOptionsDtoSchema,
});

// Tipos inferidos
export type PdfOptionsDto = z.infer<typeof PdfOptionsDtoSchema>;
export type GeneratePDFDto = z.infer<typeof GeneratePDFDtoSchema>;