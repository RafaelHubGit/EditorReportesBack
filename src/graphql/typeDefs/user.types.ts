import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
    type User {
        id: ID!
        email: String!
        name: String!
        createdAt: String!
        updatedAt: String!
    }

    input RegisterInput {
        email: String!
        password: String!
        name: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input UpdateUserInput {
        name: String
        email: String
    }

    type AuthPayload {
        token: String!
        refreshToken: String!
        user: User!
    }

    extend type Query {
        # Users
        me: User
        users: [User!]!
        user(id: ID!): User
    }

    extend type Mutation {
        # Auth
        register(input: RegisterInput!): AuthPayload!
        login(input: LoginInput!): AuthPayload!
        refreshToken: AuthPayload!
        
        # Users
        updateUser(input: UpdateUserInput!): User!
        deleteUser: Boolean!
        changePassword(oldPassword: String!, newPassword: String!): Boolean!
    }
`;