import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User.entity';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService {
    private static userRepository = AppDataSource.getRepository(User);

    static async createUser(userData: {
        email: string;
        password: string;
        name: string;
    }) {
        const { email, password, name } = userData;

        // Verificar si el usuario ya existe
        const existingUser = await this.userRepository.findOne({
            where: { email }
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear usuario
        const user = this.userRepository.create({
            email,
            password_hash: hashedPassword,
            name
        });

        await this.userRepository.save(user);

        // Eliminar password del objeto retornado
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async authenticateUser(email: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { email }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generar tokens
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
            { expiresIn: '7d' }
        );

        // Eliminar password del objeto retornado
        const { password_hash, ...userWithoutPassword } = user;

        return {
            token,
            refreshToken,
            user: userWithoutPassword
        };
    }

    static async getUserById(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'email', 'name', 'created_at', 'updated_at']
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    static async getCurrentUser(userId: string) {
        return await this.getUserById(userId);
    }

    static async getAllUsers() {
        return await this.userRepository.find({
            select: ['id', 'email', 'name', 'created_at', 'updated_at']
        });
    }

    static async updateUser(userId: string, updateData: {
        name?: string;
        email?: string;
    }) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verificar si el email ya está en uso
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateData.email }
            });

            if (existingUser) {
                throw new Error('Email already in use');
            }
        }

        // Actualizar usuario
        Object.assign(user, updateData);
        await this.userRepository.save(user);

        // Eliminar password del objeto retornado
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async deleteUser(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        await this.userRepository.remove(user);
        return true;
    }

    static async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid current password');
        }

        user.password_hash = await bcrypt.hash(newPassword, 12);
        await this.userRepository.save(user);

        return true;
    }

    static async verifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
            return await this.getUserById(decoded.userId);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    static async refreshUserToken(refreshToken: string) {
        try {
            const decoded = jwt.verify(
                refreshToken, 
                process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
            ) as any;

            const user = await this.getUserById(decoded.userId);

            // Generar nuevos tokens
            const newToken = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '1h' }
            );

            const newRefreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
                { expiresIn: '7d' }
            );

            return {
                token: newToken,
                refreshToken: newRefreshToken,
                user
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
}