import { FolderService } from "../../../services/folder.service";


const getUserId = () => '65a1b2c3d4e5f67890123456'; // Temporal

export const folderMutations = {
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
};