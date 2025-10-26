
export const folderResolvers = {
    Folder: {
        parent: async (parent: any) => {
            if (!parent.parentId) return null;
            return null;
        },
        templates: async (parent: any) => {
            return parent.templateIds || [];
        },
        subfolders: async (parent: any) => {
            return [];
        },
    },
};