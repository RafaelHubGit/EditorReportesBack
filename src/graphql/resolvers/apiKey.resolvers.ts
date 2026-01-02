import { ApiKeyService } from "../../services/apiKey.service";
import { requireAuth } from "../../guards/auth.guard";
import { createContext } from "node:vm";



export const apiKeyResolvers = {
    ApiKey: {
        createdAt: (parent: any) => parent.created_at,
        updatedAt: (parent: any) => parent.updated_at,
    },
    Query: {
        getApiKeyByUserId: async (_: any, context: any) => await ApiKeyService.getApiKeyByUserId(context.userId),
        getApiKeyActiveByType: async (_: any, context: any) => await ApiKeyService.getApiKeyActiveByType(context.type),
    },
    Mutation: {
        createApiKey: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            return await ApiKeyService.createApiKey(input)
        }),
        renewApiKey: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            return await ApiKeyService.renewApiKey(input.apiKey, input.type, input.userId)
        }),
        deleteLogicalApiKey: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            return await ApiKeyService.deleteLogicalApiKey(input.apiKey)
        }),
    }
}   