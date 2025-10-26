import { FolderService } from "../../services/folder.service";
import { TemplateService } from "../../services/template.service";


const getUserId = () => '65a1b2c3d4e5f67890123456'; // Temporal

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
    

        allTemplates: async () => {
            console.log("🟢 [RESOLVER] allTemplates EJECUTADO");
            try {
                const result = await TemplateService.getAllTemplates();
                console.log("📦 Resultado del servicio:", result);
                return result;
            } catch (error) {
                console.error("🔴 Error en resolver:", error);
                return [];
            }
        },

        templatesByUser: async () => {
            const userId = getUserId();
            return await TemplateService.getTemplatesByUser(userId);
        },

        templatesByIdAndUserId: async (_: any, { id }: { id: string }) => {
            const userId = getUserId();
            return await TemplateService.getTemplateByIdAndUserId(id, userId);
        },

        template: async (_: any, { id }: { id: string }) => {
            const userId = getUserId();
            return await TemplateService.getTemplateByIdAndUserId(id, userId);
        },

        templatesByFolder: async (_: any, { folderId }: { folderId: string }) => {
            const userId = getUserId();
            return await TemplateService.getTemplatesByFolder(folderId, userId);
        },

        rootTemplates: async () => {
            const userId = getUserId();
            return await TemplateService.getRootTemplates(userId);
        },

        searchTemplates: async (_: any, { searchTerm, tags }: { searchTerm?: string; tags?: string[] }) => {
            const userId = getUserId();
            return await TemplateService.searchTemplates(userId, searchTerm || '', tags);
        },
    },

    Mutation: {
        createTemplate: async (_: any, { input }: { input: any }) => {
            const userId = getUserId();
            return await TemplateService.createTemplate({
                ...input,
                owner: userId,
            });
        },

        updateTemplate: async (_: any, { id, input }: { id: string; input: any }) => {
            const userId = getUserId();
            return await TemplateService.updateTemplate(id, userId, input);
        },

        deleteTemplate: async (_: any, { id }: { id: string }) => {
            const userId = getUserId();
            return await TemplateService.deleteTemplate(id, userId);
        },

        shareTemplate: async (_: any, { id, input }: { id: string; input: any }) => {
            const userId = getUserId();
            return await TemplateService.shareTemplate(id, userId, input.targetUserIds, input.isPublic);
        },

        moveTemplate: async (_: any, { templateId, folderId }: { templateId: string; folderId?: string }) => {
            const userId = getUserId();
            return await FolderService.moveTemplateToFolder(templateId, folderId || null, userId);
        },
    }
};