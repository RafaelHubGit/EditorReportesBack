export const templateResolvers = {
    folder: async (parent: any) => {
        if (!parent.folderId) return null;
        // TODO: Implementar populate cuando tengamos auth real
        return null;
    },
};