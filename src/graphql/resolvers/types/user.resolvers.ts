export const userResolvers = {
    User: {
        // Mapear los campos de fecha de PostgreSQL a GraphQL
        createdAt: (parent: any) => parent.created_at,
        updatedAt: (parent: any) => parent.updated_at,
    },
};