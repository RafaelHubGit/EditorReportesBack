export const templateResolvers = {
    Template: {
        folder: async (parent: any) => {
            if (!parent.folderId) return null;
            return null;
        },
    },
};