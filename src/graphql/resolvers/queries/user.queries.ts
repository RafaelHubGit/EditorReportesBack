import { UserService } from "../../../services/use.service";

export const userQueries = {
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
};