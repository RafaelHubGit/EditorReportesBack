import { gql } from 'graphql-tag';

export const typeDefs = gql`
    # Tipos principales
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

    type Folder {
        id: ID!
        name: String!
        description: String
        owner: ID!
        parent: Folder
        parentId: ID
        templates: [Template!]!
        templateCount: Int!
        icon: String
        color: String
        isShared: Boolean!
        sharedWith: [ID!]!
        subfolders: [Folder!]!
        
        # Metadata
        createdAt: String!
        updatedAt: String!
    }

    # Tipos de configuración
    type AccessConfig {
        isPublic: Boolean!
        sharedWith: [ID!]!
    }

    # Enums
    enum TemplateStatus {
        DRAFT
        PUBLISHED
        ARCHIVED
    }

    # Input types para mutations
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

    input FolderInput {
        name: String!
        description: String
        parentId: ID
        icon: String
        color: String
    }

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

    # Queries
    type Query {
        # Templates
        templates: [Template!]!
        template(id: ID!): Template
        templatesByFolder(folderId: ID!): [Template!]!
        rootTemplates: [Template!]!
        searchTemplates(searchTerm: String, tags: [String!]): [Template!]!
        
        # Folders
        folders: [Folder!]!
        folder(id: ID!): Folder
        folderTree: [FolderTree!]!
        
        # Auth (para después)
        me: User
    }

    # Folder tree para estructura jerárquica
    type FolderTree {
        id: ID!
        name: String!
        icon: String
        color: String
        templateCount: Int!
        subfolders: [FolderTree!]!
    }

    # Mutations
    type Mutation {
        # Templates
        createTemplate(input: TemplateInput!): Template!
        updateTemplate(id: ID!, input: TemplateUpdateInput!): Template!
        deleteTemplate(id: ID!): Boolean!
        shareTemplate(id: ID!, input: ShareInput!): Template!
        moveTemplate(templateId: ID!, folderId: ID): Boolean!
        
        # Folders
        createFolder(input: FolderInput!): Folder!
        updateFolder(id: ID!, input: FolderInput!): Folder!
        deleteFolder(id: ID!, moveTemplatesToRoot: Boolean): Boolean!
        createSubfolder(parentFolderId: ID!, input: FolderInput!): Folder!
        shareFolder(id: ID!, input: ShareInput!): Folder!
        
        # Auth (para después)
        register(email: String!, password: String!, name: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
        refreshToken: AuthPayload!
    }

    # Scalars
    scalar JSON
`;