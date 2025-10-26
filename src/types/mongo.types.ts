import { Document, ObjectId } from 'mongoose';

export interface ITemplate extends Document {
    // MVP Core
    name: string;
    html: string;
    css: string;
    jsonSchema: Record<string, any>;  // Estructura esperada
    sampleData: Record<string, any>;   // Datos de prueba
    owner: ObjectId;                   // Relación con usuario
    folderId?: ObjectId;
    
    // Preparado para expansión
    projectId?: ObjectId;
    access: {
        isPublic: boolean;
        sharedWith: ObjectId[];
    };
    status: 'draft' | 'published' | 'archived';
    version: number;
    tags: string[];
    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

export interface IFolder extends Document {
    name: string;
    description?: string;
    owner: ObjectId;
    parentId?: ObjectId;  // Para estructura de árbol
    templateIds: ObjectId[];
    icon?: string;
    color?: string;
    isShared: boolean;
    sharedWith: ObjectId[];
    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
}