import { JSONScalar } from '../scalars/JSON';

import { queries } from './queries/index';
import { mutations } from './mutations/index';
import { typeResolvers } from './types/index';

export const resolvers = {
    // Scalars
    JSON: JSONScalar,

    // Queries
    Query: queries,

    // Mutations
    Mutation: mutations,

    // Field resolvers
    ...typeResolvers,
};