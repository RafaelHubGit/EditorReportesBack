import { UserService } from "../../../services/use.service";


export const userMutations = {
    register: async (_: any, { input }: { input: any }) => {
        return await UserService.createUser(input);
    },

    login: async (_: any, { input }: { input: any }) => {
        const { email, password } = input;
        return await UserService.authenticateUser(email, password);
    },

    refreshToken: async (_: any, __: any, context: any) => {
        // TODO: Implementar con refresh token del contexto
        // const refreshToken = context.refreshToken;
        // return await UserService.refreshUserToken(refreshToken);
        throw new Error('Refresh token not implemented yet');
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
};