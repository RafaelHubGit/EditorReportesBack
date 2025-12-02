import { UserService } from "../../services/use.service";


export const userResolvers = {
    User: {
        createdAt: (parent: any) => parent.created_at,
        updatedAt: (parent: any) => parent.updated_at,
    },

    Query: {
        me: async (_: any, __: any, context: any) => {
            // TODO: Implementar con contexto de autenticación
            // const userId = context.user.id;
            // return await UserService.getCurrentUser(userId);
            
            // Temporal: retornar null hasta implementar auth
            return null;
        },

        users: async () => {
            return await UserService.getAllUsers();
        },

        user: async (_: any, { id }: { id: string }) => {
            return await UserService.getUserById(id);
        },
    },

    Mutation: {
        register: async (_: any, { input }: { input: any }) => {
            console.log("INPUT : : ", input);
            return await UserService.createUser(input);
        },

        login: async (_: any, { input }: { input: any }) => {
            const { email, password } = input;
            return await UserService.authenticateUser(email, password);
        },

        refreshToken: async (_: any, { input }: { input: any }) => {
            const refreshToken = input.refreshToken;
            return await UserService.refreshUserToken(refreshToken);
        },

        updateUser: async (_: any, { input }: { input: any }, context: any) => {
            // TODO: Implementar con contexto de autenticación
            // const userId = context.user.id;
            // return await UserService.updateUser(userId, input);
            throw new Error('Authentication required');
        },

        deleteUser: async (_: any, __: any, context: any) => {
            // TODO: Implementar con contexto de autenticación
            // const userId = context.user.id;
            // return await UserService.deleteUser(userId);
            throw new Error('Authentication required');
        },

        changePassword: async (_: any, { oldPassword, newPassword }: { 
            oldPassword: string; 
            newPassword: string 
        }, context: any) => {
            // TODO: Implementar con contexto de autenticación
            // const userId = context.user.id;
            // return await UserService.changePassword(userId, oldPassword, newPassword);
            throw new Error('Authentication required');
        },
    }
};