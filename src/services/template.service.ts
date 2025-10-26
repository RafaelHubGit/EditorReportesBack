import { Template } from '../models/Template.model';
import { ITemplate } from '../types/mongo.types';

export class TemplateService {
    // Crear un nuevo template
    static async createTemplate(templateData: Partial<ITemplate>): Promise<ITemplate> {
        try {
        const template = new Template(templateData);
        return await template.save();
        } catch (error) {
        throw new Error(`Error creating template: ${error.message}`);
        }
    }

    // Obtener templates por usuario
    static async getTemplatesByUser(userId: string): Promise<ITemplate[]> {
        try {
        return await Template.find({ owner: userId })
            .sort({ createdAt: -1 })
            .exec();
        } catch (error) {
        throw new Error(`Error fetching templates: ${error.message}`);
        }
    }

    // Obtener template por ID
    static async getTemplateById(templateId: string, userId: string): Promise<ITemplate | null> {
        try {
        return await Template.findOne({
            _id: templateId,
            $or: [
            { owner: userId },
            { 'access.sharedWith': userId },
            { 'access.isPublic': true }
            ]
        }).exec();
        } catch (error) {
        throw new Error(`Error fetching template: ${error.message}`);
        }
    }

    // Actualizar template
    static async updateTemplate(
        templateId: string, 
        userId: string, 
        updateData: Partial<ITemplate>
    ): Promise<ITemplate | null> {
        try {
        return await Template.findOneAndUpdate(
            { 
            _id: templateId, 
            owner: userId  // Solo el owner puede actualizar
            },
            { 
            ...updateData,
            version: { $inc: 1 }  // Incrementar versión
            },
            { new: true, runValidators: true }
        ).exec();
        } catch (error) {
        throw new Error(`Error updating template: ${error.message}`);
        }
    }

    // Eliminar template
    static async deleteTemplate(templateId: string, userId: string): Promise<boolean> {
        try {
        const result = await Template.deleteOne({
            _id: templateId,
            owner: userId  // Solo el owner puede eliminar
        }).exec();
        
        return result.deletedCount > 0;
        } catch (error) {
        throw new Error(`Error deleting template: ${error.message}`);
        }
    }

    // Buscar templates por tags o nombre
    static async searchTemplates(
        userId: string, 
        searchTerm: string, 
        tags?: string[]
    ): Promise<ITemplate[]> {
        try {
        const query: any = {
            $or: [
            { owner: userId },
            { 'access.sharedWith': userId },
            { 'access.isPublic': true }
            ]
        };

        if (searchTerm) {
            query.name = { $regex: searchTerm, $options: 'i' };
        }

        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }

        return await Template.find(query)
            .sort({ createdAt: -1 })
            .exec();
        } catch (error) {
        throw new Error(`Error searching templates: ${error.message}`);
        }
    }


    // Obtener templates por folder
    static async getTemplatesByFolder(folderId: string, userId: string): Promise<ITemplate[]> {
        try {
        return await Template.find({
            folderId: folderId,
            $or: [
            { owner: userId },
            { 'access.sharedWith': userId },
            { 'access.isPublic': true }
            ]
        })
        .sort({ createdAt: -1 })
        .exec();
        } catch (error) {
        throw new Error(`Error fetching folder templates: ${error.message}`);
        }
    }

    // Obtener templates sin folder (root)
    static async getRootTemplates(userId: string): Promise<ITemplate[]> {
        try {
        return await Template.find({
            owner: userId,
            folderId: { $exists: false }
        })
        .sort({ createdAt: -1 })
        .exec();
        } catch (error) {
        throw new Error(`Error fetching root templates: ${error.message}`);
        }
    }

    // Compartir template con otros usuarios
    static async shareTemplate(
        templateId: string,
        userId: string,
        targetUserIds: string[],
        isPublic: boolean = false
    ): Promise<ITemplate | null> {
        try {
        return await Template.findOneAndUpdate(
            { 
            _id: templateId, 
            owner: userId  // Solo el owner puede compartir
            },
            {
            $addToSet: { 'access.sharedWith': { $each: targetUserIds } },
            'access.isPublic': isPublic
            },
            { new: true, runValidators: true }
        ).exec();
        } catch (error) {
        throw new Error(`Error sharing template: ${error.message}`);
        }
    }
}