import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import { join } from 'path';


const loadSchema = (filename: string) => {
    return readFileSync(join(__dirname, '../schema', filename), 'utf-8');
};

export const typeDefs = gql`
    type Query {
        _empty: String
    }

    type Mutation {
        # Auth (para después)
        register(email: String!, password: String!, name: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
        refreshToken: AuthPayload!
    }
    ${loadSchema('base.graphql')}
    ${loadSchema('user.graphql')}
    ${loadSchema('folder.graphql')}
    ${loadSchema('template.graphql')}
    
    `;
    // ${baseTypeDefs}
    // ${templateTypeDefs}
    // ${folderTypeDefs}
    // ${userTypeDefs}