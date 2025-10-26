import { FolderService } from "../../../services/folder.service";
import { TemplateService } from "../../../services/template.service";


const getUserId = () => '65a1b2c3d4e5f67890123456'; // Temporal

export const templateMutations = {
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
};