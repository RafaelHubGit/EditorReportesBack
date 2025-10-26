import { JSONScalar } from '../scalars/JSON';
import { templateResolvers } from './template.resolvers';
import { folderResolvers } from './folder.resolvers';
import { userResolvers } from './user.resolvers';

export const resolvers = {
    // Scalars PRIMERO
    JSON: JSONScalar,

    // Query y Mutation
    Query: {
        ...templateResolvers.Query,
        ...folderResolvers.Query, 
        ...userResolvers.Query,
    },

    Mutation: {
        ...templateResolvers.Mutation,
        ...folderResolvers.Mutation,
        ...userResolvers.Mutation,
    },

    // Field resolvers AL FINAL
    ...templateResolvers.Template ? { Template: templateResolvers.Template } : {},
    ...folderResolvers.Folder ? { Folder: folderResolvers.Folder } : {},
    ...userResolvers.User ? { User: userResolvers.User } : {},
};
