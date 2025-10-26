import { gql } from 'graphql-tag';

export const baseTypeDefs = gql`
    scalar JSON

    # Enums
    enum TemplateStatus {
        DRAFT
        PUBLISHED
        ARCHIVED
    }

    # Input types para mutations
    input ShareInput {
        targetUserIds: [ID!]!
        isPublic: Boolean
    }

    # Responses
    type AuthPayload {
        token: String!
        refreshToken: String!
        user: User
    }

    type User {
        id: ID!
        email: String!
        name: String!
        createdAt: String!
    }
`;