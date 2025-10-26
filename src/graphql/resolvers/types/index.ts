import { templateResolvers } from './template.resolvers';
import { folderResolvers } from './folder.resolvers';
import { userResolvers } from './user.resolvers';

export const typeResolvers = {
    ...templateResolvers,
    ...folderResolvers,
    ...userResolvers,
};