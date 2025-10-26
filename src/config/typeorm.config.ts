import { DataSource } from 'typeorm';
import { User } from '../entities/User.entity';
import { environment } from './enviroment';


export const AppDataSource = new DataSource({
    type: 'postgres',
    url: environment.postgresUri,
    entities: [User],
    synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
    logging: process.env.NODE_ENV !== 'production',
});