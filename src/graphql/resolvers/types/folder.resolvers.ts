export const folderResolvers = {
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
};