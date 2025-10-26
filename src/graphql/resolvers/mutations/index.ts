import { templateMutations } from './template.mutations';
import { folderMutations } from './folder.mutations';
import { userMutations } from './user.mutations';

export const mutations = {
    // Templates
    ...templateMutations,
    
    // Folders
    ...folderMutations,

    // Users
    ...userMutations,

    
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
};