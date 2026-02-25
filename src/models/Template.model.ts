import { Schema, model } from 'mongoose';
import { ITemplate } from '../types/mongo.types';

const TemplateSchema = new Schema<ITemplate>({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    html: {
        type: String,
        required: [true, 'HTML content is required'],
    },
    
    css: {
        type: String,
        default: '',
    },
    
    htmlHeader: {
        type: String,
        default: '',
    },
    
    cssHeader: {
        type: String,
        default: '',
    },
    
    htmlFooter: {
        type: String,
        default: '',
    },
    
    cssFooter: {
        type: String,
        default: '',
    },
    
    jsonSchema: {
        type: Schema.Types.Mixed,
        required: [true, 'JSON schema is required'],
    },
    
    sampleData: {
        type: Schema.Types.Mixed,
        required: [true, 'Sample data is required'],
    },

    // Configuración de Página (Puppeteer)
    pageConfig: {
        format: { type: String, default: 'A4' }, // A4, Letter, Custom, etc.
        unit: { type: String, default: 'mm' },   // mm, cm, in, px
        width: { type: Number },
        height: { type: Number },
        landscape: { type: Boolean, default: false }, // vertical (false) horizontal(true)
        margin: {
            top: { type: String, default: '10mm' },
            right: { type: String, default: '10mm' },
            bottom: { type: String, default: '10mm' },
            left: { type: String, default: '10mm' }
        }
    },
    
    owner: {
        type: String,
        required: [true, 'Owner is required'],
    },
    
    folderId: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    
    // PREPARADO PARA EXPANSIÓN
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    
    access: {
        isPublic: {
            type: Boolean,
            default: false
        },
        sharedWith: [{
            type: String
        }]
    },
    
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    
    version: {
        type: Number,
        default: 1
    },
    
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,  // Crea createdAt y updatedAt automáticamente
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para mejor performance
TemplateSchema.index({ owner: 1, createdAt: -1 });
TemplateSchema.index({ folderId: 1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ status: 1 });

// Virtual para contar usos (para el futuro)
TemplateSchema.virtual('usageCount').get(function() {
    // Esto se puede implementar después con un contador
    return 0;
});

export const Template = model<ITemplate>('Template', TemplateSchema);