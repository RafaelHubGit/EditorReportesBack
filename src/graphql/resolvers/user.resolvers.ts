import { requireAuth } from "../../guards/auth.guard";
import { UserService } from "../../services/use.service";


export const userResolvers = {
    User: {
        createdAt: (parent: any) => parent.created_at,
        updatedAt: (parent: any) => parent.updated_at,
    },

    Query: {
        me: requireAuth(async (_: any, __: any, context: any) => {
            return context.user;
        }),

        users: requireAuth(async (_: any, __: any, context: any) => {
            return await UserService.getAllUsers();
        }),

        user: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
            return await UserService.getUserById(id);
        }),
    },

    Mutation: {
        register: async (_: any, { input }: { input: any }) => {
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

        updateUser: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            return await UserService.updateUser(context.user.id, input);
        }),

        deleteUser: requireAuth(async (_: any, __: any, context: any) => {
            return await UserService.deleteUser(context.user.id);
        }),

        changePassword: requireAuth(async (_: any, { oldPassword, newPassword }: { 
            oldPassword: string; 
            newPassword: string 
        }, context: any) => {
            return await UserService.changePassword(context.user.id, oldPassword, newPassword);
        }),
    }
};