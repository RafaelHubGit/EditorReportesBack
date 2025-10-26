import { FolderService } from "../../../services/folder.service";


const getUserId = () => '65a1b2c3d4e5f67890123456'; // Temporal

export const folderQueries = {
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
};