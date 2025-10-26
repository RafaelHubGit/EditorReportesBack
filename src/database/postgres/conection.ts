import { Pool } from 'pg';
import { environment } from '../../config/enviroment';


// Pool de conexiones para PostgreSQL
export const postgresPool = new Pool({
    connectionString: environment.postgresUri,
    max: 20, // máximo de conexiones en el pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export async function connectPostgreSQL() {
    try {
        console.log('🔄 Connecting to PostgreSQL...');
        
        // Probar la conexión
        const client = await postgresPool.connect();
        console.log('✅ PostgreSQL connected successfully');
        
        // Liberar el cliente de prueba
        client.release();
        
        // Manejar eventos de error
        postgresPool.on('error', (err) => {
        console.error('❌ PostgreSQL pool error:', err);
        });

    } catch (error) {
        console.error('❌ Failed to connect to PostgreSQL:', error);
        process.exit(1);
    }
}

// Función para health check de la base de datos
export async function checkPostgreSQLHealth() {
    try {
        const client = await postgresPool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        client.release();
        return { status: 'healthy', timestamp: result.rows[0].current_time };
    } catch (error) {
        return { status: 'unhealthy', error: error.message };
    }
}