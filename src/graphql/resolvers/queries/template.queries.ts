import { TemplateService } from "../../../services/template.service";


const getUserId = () => '65a1b2c3d4e5f67890123456'; // Temporal

export const templateQueries = {
    templates: async () => {
        const userId = getUserId();
        return await TemplateService.getTemplatesByUser(userId);
    },

    template: async (_: any, { id }: { id: string }) => {
        const userId = getUserId();
        return await TemplateService.getTemplateById(id, userId);
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
};