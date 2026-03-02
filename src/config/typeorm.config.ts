import { DataSource } from 'typeorm';
import { User } from '../entities/User.entity';
import { environment } from './enviroment';
import { ApiKey } from '../entities/ApiKey.entity';
import { UserAuthToken } from '../entities/UserAuthToken.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: environment.postgresUri,
    entities: [User, ApiKey, UserAuthToken],
    // synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
    migrations: [__dirname + '/../migrations/*.ts'],
});