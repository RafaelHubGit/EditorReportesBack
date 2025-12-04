import { v4 as uuidv4 } from "uuid";
import { FolderService } from "../../services/folder.service";
import { TemplateService } from "../../services/template.service";
import { requireAuth } from "../../guards/auth.guard";

export const templateResolvers = {
    Template: {
        folder: async (parent: any) => {
            if (!parent.folderId) return null;
            // TODO: Implementar populate cuando tengamos auth real
            return null;
        },
    },

    Query: {

        testQuery: () => {
            console.log("🟢 TEST QUERY EJECUTADO");
            return [{ id: "test", name: "Test Template" }];
        },


        allTemplates: requireAuth(async (_: any, __: any, context: any) => {
            console.log("🟢 [RESOLVER] allTemplates EJECUTADO");
            try {
                const result = await TemplateService.getAllTemplates();
                console.log("📦 Resultado del servicio:", result);
                return result;
            } catch (error) {
                console.error("🔴 Error en resolver:", error);
                return [];
            }
        }),

        templatesByUser: requireAuth(async (_: any, __: any, context: any) => {
            const userId = context.user.id;
            return await TemplateService.getTemplatesByUser(userId);
        }),

        templatesByIdAndUserId: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
            const userId = context.user.id;
            return await TemplateService.getTemplateByIdAndUserId(id, userId);
        }),

        template: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
            const userId = context.user.id;
            return await TemplateService.getTemplateByIdAndUserId(id, userId);
        }),

        templatesByFolder: requireAuth(async (_: any, { folderId }: { folderId: string }, context: any) => {
            const userId = context.user.id;
            return await TemplateService.getTemplatesByFolder(folderId, userId);
        }),

        rootTemplates: requireAuth(async (_: any, __: any, context: any) => {   
            const userId = context.user.id;
            return await TemplateService.getRootTemplates(userId);
        }),

        searchTemplates: requireAuth(async (_: any, { searchTerm, tags }: { searchTerm?: string; tags?: string[] }, context: any) => {
            const userId = context.user.id;
            return await TemplateService.searchTemplates(userId, searchTerm || '', tags);
        }),
    },

    Mutation: {
        createTemplate: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            const userId = context.user.id;
            if (!input.id) {
                input.id = uuidv4();
            }
            input.createdAt = new Date().toISOString();
            input.updatedAt = new Date().toISOString();
            input.jsonSchema = {}; //TODO: Implementar, debe de crear el jsonSchema a partir de sampleData
            input.status = 'draft';
            return await TemplateService.createTemplate({
                ...input,
                owner: userId,
            });
        }),

        updateTemplate: requireAuth(async (_: any, { id, input }: { id: string; input: any }, context: any) => {
            const userId = context.user.id;
            return await TemplateService.updateTemplate(id, userId, input);
        }),

        deleteTemplate: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
            const userId = context.user.id;
            return await TemplateService.deleteTemplate(id, userId);
        }),

        shareTemplate: requireAuth(async (_: any, { id, input }: { id: string; input: any }, context: any) => {
            const userId = context.user.id;
            return await TemplateService.shareTemplate(id, userId, input.targetUserIds, input.isPublic);
        }),

        moveTemplate: requireAuth(async (_: any, { templateId, folderId }: { templateId: string; folderId?: string }, context: any) => {
            const userId = context.user.id;
            return await FolderService.moveTemplateToFolder(templateId, folderId || null, userId);
        }),
    }
};