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
    
    jsonSchema: {
        type: Schema.Types.Mixed,
        required: [true, 'JSON schema is required'],
    },
    
    sampleData: {
        type: Schema.Types.Mixed,
        required: [true, 'Sample data is required'],
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