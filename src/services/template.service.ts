
import { ITemplate } from '../types/mongo.types';
import { Template } from '../models/Template.model';

export class TemplateService {
    // Crear un nuevo template
    static async createTemplate(templateData: Partial<ITemplate>): Promise<ITemplate> {
        try {
            const template = new Template(templateData);
            return await template.save();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error creating template: ${message}`);
        }
    }

    // Obtener all templates 
    static async getAllTemplates(): Promise<ITemplate[]> {
        try {
            console.log("🟢 [getAllTemplates] EJECUTANDO...");

            const templates = await Template.find().exec();

            console.log("📦 Templates encontrados:", templates);
            console.log("🔢 Número de templates:", templates?.length || 0);
            console.log("📝 Tipo de templates:", typeof templates);
            console.log("🔍 Es array?:", Array.isArray(templates));

            if (!templates) {
                console.log("❌ templates es NULL o UNDEFINED");
                return []; // ← Nunca retornes null
            }

            if (templates.length === 0) {
                console.log("ℹ️  No hay templates, retornando array vacío");
                return [];
            }

            console.log("✅ Retornando templates:", templates.length);
            return templates;
        } catch (error) {
            console.error("🔴 ERROR en getAllTemplates:", error);
            // console.error("Stack:", error.stack);
            // Nunca retornes null, siempre retorna array vacío
            return [];
        }
    }

    // Obtener templates por usuario
    static async getTemplatesByUser(userId: string): Promise<ITemplate[]> {
        try {
            return await Template.find({ owner: userId })
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching templates: ${message}`);
        }
    }

    // Obtener template por ID y usuario ID 
    static async getTemplateByIdAndUserId(templateId: string, userId: string): Promise<ITemplate | null> {
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
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching template: ${message}`);
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
                    // version: { $inc: 1 }  // Incrementar versión
                },
                { new: true, runValidators: true }
            ).exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error updating template: ${message}`);
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
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error deleting template: ${message}`);
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
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error searching templates: ${message}`);
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
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching folder templates: ${message}`);
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
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching root templates: ${message}`);
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
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error sharing template: ${message}`);
        }
    }
}