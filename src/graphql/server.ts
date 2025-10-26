import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { resolvers } from './resolvers/index';
import { typeDefs } from './schema/index';

export async function createApolloServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        // plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: false })],
        // introspection: process.env.NODE_ENV !== 'production',
        formatError: (error) => {
            console.error('GraphQL Error:', error);
            return {
                message: error.message,
                code: error.extensions?.code || 'INTERNAL_ERROR',
            };
        },
    });

    await server.start();
    return server;
}

export const apolloMiddleware = (server: ApolloServer) => 
    expressMiddleware(server, {
        context: async ({ req }) => {
        // TODO: Implementar autenticación JWT
        // const token = req.headers.authorization?.replace('Bearer ', '');
        // const user = await verifyToken(token);
        
        return {
            // user,
            // authScope: token ? 'authenticated' : 'public'
        };
        },
    }
);