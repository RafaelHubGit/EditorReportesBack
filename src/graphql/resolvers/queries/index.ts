import { templateQueries } from './template.queries';
import { folderQueries } from './folder.queries';
import { userQueries } from './user.queries';

export const queries = {
    // Templates
    ...templateQueries,
    
    // Folders
    ...folderQueries,

    // Users
    ...userQueries,
    
    // Auth (para después)
    // me: async () => {
    //     // TODO: Implementar cuando tengamos auth
    //     return null;
    // },
};