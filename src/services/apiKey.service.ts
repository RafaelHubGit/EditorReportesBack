import { ApiKey } from "../entities/ApiKey.entity";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

export class ApiKeyService {

    private static keyRepository: Repository<ApiKey>;


    public static async createApiDevelopmentKey(userId: string) {
        return await this.createApiKey({
            userId: userId,
            type: 'development',
            rate_limit: 10000,
            rate_limit_per_day: 10000
        });
    }

    public static async createApiProductionKey(userId: string) {
        return await this.createApiKey({
            userId: userId,
            type: 'production',
            rate_limit: 1000,
            rate_limit_per_day: 1000
        });
    }

    static async deleteLogicalApiKey(apiKey: ApiKey) {
        apiKey.isActive = false;
        await this.keyRepository.save(apiKey);
    }

    static async updateApiKey(apiKey: ApiKey) {
        await this.keyRepository.save(apiKey);
    }

    static async validateApiKey(apiKey: string) {
        const apiKeyEntity = await this.keyRepository.findOneBy({ api_key: apiKey });
        if (apiKeyEntity?.isActive === false || apiKeyEntity?.isActive === null) {
            throw new Error('Invalid API key');
        }
        return apiKeyEntity;
    }

    static async getApiKeys() {
        return await this.keyRepository.find();
    }

    static async getApiKeyById(id: string) {
        return await this.keyRepository.findOneBy({ id });
    }

    static async getApiKeyByApiKey(apiKey: string) {
        return await this.keyRepository.findOneBy({ api_key: apiKey });
    }

    static async getApiKeyByUserId(userId: string) {
        return await this.keyRepository.findOneBy({ user: { id: userId } });
    }

    static async getApiKeyActiveByType(type: 'development' | 'production') {
        return await this.keyRepository.findOneBy({ type, isActive: true });
    }

    static async renewApiKey(apiKey: string, type: 'development' | 'production', userId: string) {
        const existingApiKey = await this.getApiKeyByApiKey(apiKey);
        if (!existingApiKey) {
            throw new Error('API key not found');
        }
        await this.deleteLogicalApiKey(existingApiKey);

        if (type === 'development') {
            return await this.createApiDevelopmentKey(userId);
        }

        if (type === 'production') {
            return await this.createApiProductionKey(userId);
        }
    }

    static async createApiKey(apiKeyData: {
        userId: string;
        type: 'development' | 'production';
        rate_limit: number;
        rate_limit_per_day: number;
    }) {
        const { userId, type, rate_limit, rate_limit_per_day } = apiKeyData;

        const apiKeyCode = uuidv4();

        const apiKey = this.keyRepository.create({
            api_key: apiKeyCode,
            user: { id: userId },
            type,
            rate_limit,
            rateLimitPerDay: rate_limit_per_day
        });
        await this.keyRepository.save(apiKey);
        return apiKey;
    }

}   