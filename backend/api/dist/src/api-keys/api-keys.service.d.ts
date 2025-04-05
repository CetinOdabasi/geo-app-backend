import { PrismaService } from '../prisma/prisma.service';
export interface MockApiKey {
    id: number;
    key: string;
    name: string;
    userId: number;
    active: boolean;
    dailyLimit: number;
    usageCount: number;
    lastResetDate: Date;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
interface CreateApiKeyDto {
    name: string;
    dailyLimit?: number;
    active?: boolean;
    expiresAt?: string;
}
interface UpdateApiKeyDto {
    name?: string;
    dailyLimit?: number;
    active?: boolean;
    expiresAt?: string;
}
export declare class ApiKeysService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: number, createApiKeyDto: CreateApiKeyDto): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        userId: number;
        active: boolean;
        dailyLimit: number;
        usageCount: number;
        lastResetDate: Date;
        expiresAt: Date | null;
    }>;
    findAll(userId: number): Promise<MockApiKey[]>;
    findOne(id: number, userId: number): Promise<MockApiKey>;
    update(id: number, userId: number, updateApiKeyDto: UpdateApiKeyDto): Promise<MockApiKey>;
    remove(id: number, userId: number): Promise<MockApiKey>;
    validateApiKey(key: string): Promise<MockApiKey>;
    incrementApiKeyUsage(apiKeyId: number, endpoint: string): Promise<MockApiKey>;
}
export {};
