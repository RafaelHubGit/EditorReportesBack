import { FolderService } from "../../services/folder.service";
import { TemplateService } from "../../services/template.service";


export const resolvers = {
    // Scalars
    JSON: {
        serialize: (value: any) => value,
        parseValue: (value: any) => value,
        parseLiteral: (ast: any) => {
        switch (ast.kind) {
            case 'StringValue':
            return JSON.parse(ast.value);
            case 'ObjectValue':
            // Implementar parsing de object value si es necesario
            return ast.fields.reduce((obj: any, field: any) => {
                obj[field.name.value] = field.value.value;
                return obj;
            }, {});
            default:
            return null;
        }
        },
    },

    // Queries
    Query: {
        // Templates
        templates: async (_: any, __: any, context: any) => {
        // TODO: Implementar autenticación
        const userId = '65a1b2c3d4e5f67890123456'; // Temporal
        return await TemplateService.getTemplatesByUser(userId);
        },

        template: async (_: any, { id }: { id: string }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await TemplateService.getTemplateById(id, userId);
        },

        templatesByFolder: async (_: any, { folderId }: { folderId: string }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await TemplateService.getTemplatesByFolder(folderId, userId);
        },

        rootTemplates: async (_: any, __: any, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await TemplateService.getRootTemplates(userId);
        },

        searchTemplates: async (_: any, { searchTerm, tags }: { searchTerm?: string; tags?: string[] }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await TemplateService.searchTemplates(userId, searchTerm || '', tags);
        },

        // Folders
        folders: async (_: any, __: any, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await FolderService.getFoldersByUser(userId, true);
        },

        folder: async (_: any, { id }: { id: string }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await FolderService.getFolderById(id, userId);
        },

        folderTree: async (_: any, __: any, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await FolderService.getFolderTree(userId);
        },

        // Auth (para después)
        me: async (_: any, __: any, context: any) => {
        // TODO: Implementar cuando tengamos auth
        return null;
        },
    },

    // Mutations
    Mutation: {
        // Templates
        createTemplate: async (_: any, { input }: { input: any }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await TemplateService.createTemplate({
            ...input,
            owner: userId,
        });
        },

        updateTemplate: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await TemplateService.updateTemplate(id, userId, input);
        },

        deleteTemplate: async (_: any, { id }: { id: string }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await TemplateService.deleteTemplate(id, userId);
        },

        shareTemplate: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await TemplateService.shareTemplate(id, userId, input.targetUserIds, input.isPublic);
        },

        moveTemplate: async (_: any, { templateId, folderId }: { templateId: string; folderId?: string }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await FolderService.moveTemplateToFolder(templateId, folderId || null, userId);
        },

        // Folders
        createFolder: async (_: any, { input }: { input: any }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await FolderService.createFolder({
            ...input,
            owner: userId,
        });
        },

        updateFolder: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await FolderService.updateFolder(id, userId, input);
        },

        deleteFolder: async (_: any, { id, moveTemplatesToRoot }: { id: string; moveTemplatesToRoot?: boolean }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await FolderService.deleteFolder(id, userId, moveTemplatesToRoot ?? true);
        },

        createSubfolder: async (_: any, { parentFolderId, input }: { parentFolderId: string; input: any }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await FolderService.createSubfolder(parentFolderId, input, userId);
        },

        shareFolder: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
        const userId = '65a1b2c3d4e5f67890123456';
        return await FolderService.shareFolder(id, userId, input.targetUserIds, input.isPublic);
        },

        // Auth (placeholders para después)
        register: async () => {
        throw new Error('Auth not implemented yet');
        },
        login: async () => {
        throw new Error('Auth not implemented yet');
        },
        refreshToken: async () => {
        throw new Error('Auth not implemented yet');
        },
    },

    // Field resolvers
    Template: {
        folder: async (parent: any) => {
        if (!parent.folderId) return null;
        // TODO: Implementar populate cuando tengamos auth real
        return null;
        },
    },

    Folder: {
        parent: async (parent: any) => {
        if (!parent.parentId) return null;
        // TODO: Implementar populate cuando tengamos auth real
        return null;
        },
        templates: async (parent: any) => {
        return parent.templateIds || [];
        },
        subfolders: async (parent: any) => {
        // TODO: Implementar cuando tengamos auth real
        return [];
        },
    },
};