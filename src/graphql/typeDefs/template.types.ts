import { gql } from 'graphql-tag';

export const templateTypeDefs = gql`
    # Tipos de configuración
    type AccessConfig {
        isPublic: Boolean!
        sharedWith: [ID!]!
    }

    type Template {
        id: ID!
        name: String!
        html: String!
        css: String!
        jsonSchema: JSON!
        sampleData: JSON!
        owner: ID!
        folder: Folder
        folderId: ID
        
        # Preparado para expansión
        access: AccessConfig!
        status: TemplateStatus!
        version: Int!
        tags: [String!]!
        
        # Metadata
        createdAt: String!
        updatedAt: String!
    }

    input TemplateInput {
        name: String!
        html: String!
        css: String
        jsonSchema: JSON!
        sampleData: JSON!
        folderId: ID
        tags: [String!]
        status: TemplateStatus
    }

    input TemplateUpdateInput {
        name: String
        html: String
        css: String
        jsonSchema: JSON
        sampleData: JSON
        folderId: ID
        tags: [String!]
        status: TemplateStatus
    }

    extend type Query {
        # Templates
        templates: [Template!]!
        template(id: ID!): Template
        templatesByFolder(folderId: ID!): [Template!]!
        rootTemplates: [Template!]!
        searchTemplates(searchTerm: String, tags: [String!]): [Template!]!
    }

    extend type Mutation {
        # Templates
        createTemplate(input: TemplateInput!): Template!
        updateTemplate(id: ID!, input: TemplateUpdateInput!): Template!
        deleteTemplate(id: ID!): Boolean!
        shareTemplate(id: ID!, input: ShareInput!): Template!
        moveTemplate(templateId: ID!, folderId: ID): Boolean!
    }
`;