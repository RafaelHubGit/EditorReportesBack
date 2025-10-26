import { FolderService } from "../../services/folder.service";


const getUserId = () => '65a1b2c3d4e5f67890123456'; // Temporal

export const folderResolvers = {
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

    Query: {
        folders: async () => {
            const userId = getUserId();
            return await FolderService.getFoldersByUser(userId, true);
        },

        folder: async (_: any, { id }: { id: string }) => {
            const userId = getUserId();
            return await FolderService.getFolderById(id, userId);
        },

        folderTree: async () => {
            const userId = getUserId();
            return await FolderService.getFolderTree(userId);
        },
    },

    Mutation: {
        createFolder: async (_: any, { input }: { input: any }) => {
            const userId = getUserId();
            return await FolderService.createFolder({
                ...input,
                owner: userId,
            });
        },

        updateFolder: async (_: any, { id, input }: { id: string; input: any }) => {
            const userId = getUserId();
            return await FolderService.updateFolder(id, userId, input);
        },

        deleteFolder: async (_: any, { id, moveTemplatesToRoot }: { id: string; moveTemplatesToRoot?: boolean }) => {
            const userId = getUserId();
            return await FolderService.deleteFolder(id, userId, moveTemplatesToRoot ?? true);
        },

        createSubfolder: async (_: any, { parentFolderId, input }: { parentFolderId: string; input: any }) => {
            const userId = getUserId();
            return await FolderService.createSubfolder(parentFolderId, input, userId);
        },

        shareFolder: async (_: any, { id, input }: { id: string; input: any }) => {
            const userId = getUserId();
            return await FolderService.shareFolder(id, userId, input.targetUserIds, input.isPublic);
        },
    }
};