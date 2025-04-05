"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const mockApiKeys = [
    {
        id: 1,
        key: 'abcdef123456',
        name: 'Test API Key',
        userId: 1,
        active: true,
        dailyLimit: 100,
        usageCount: 0,
        lastResetDate: new Date(),
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
const mockApiKeyUsage = [];
let ApiKeysService = class ApiKeysService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createApiKeyDto) {
        try {
            const key = (0, crypto_1.randomBytes)(32).toString('hex');
            return await this.prisma.apiKey.create({
                data: {
                    ...createApiKeyDto,
                    key,
                    userId,
                },
            });
        }
        catch (error) {
            console.log('Prisma error, falling back to mock database', error);
            const newApiKey = {
                id: mockApiKeys.length + 1,
                key: (0, crypto_1.randomBytes)(32).toString('hex'),
                name: createApiKeyDto.name,
                userId,
                active: createApiKeyDto.active ?? true,
                dailyLimit: createApiKeyDto.dailyLimit ?? 100,
                usageCount: 0,
                lastResetDate: new Date(),
                expiresAt: createApiKeyDto.expiresAt ? new Date(createApiKeyDto.expiresAt) : null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockApiKeys.push(newApiKey);
            return newApiKey;
        }
    }
    async findAll(userId) {
        try {
            return await this.prisma.apiKey.findMany({
                where: { userId },
            });
        }
        catch (error) {
            console.log('Prisma error, falling back to mock database', error);
            return mockApiKeys.filter(apiKey => apiKey.userId === userId);
        }
    }
    async findOne(id, userId) {
        try {
            const apiKey = await this.prisma.apiKey.findFirst({
                where: { id, userId },
            });
            if (!apiKey) {
                throw new common_1.NotFoundException(`API key with ID ${id} not found`);
            }
            return apiKey;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.log('Prisma error, falling back to mock database', error);
            const apiKey = mockApiKeys.find(k => k.id === id && k.userId === userId);
            if (!apiKey) {
                throw new common_1.NotFoundException(`API key with ID ${id} not found`);
            }
            return apiKey;
        }
    }
    async update(id, userId, updateApiKeyDto) {
        try {
            await this.findOne(id, userId);
            return await this.prisma.apiKey.update({
                where: { id },
                data: updateApiKeyDto,
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.log('Prisma error, falling back to mock database', error);
            const apiKeyIndex = mockApiKeys.findIndex(k => k.id === id && k.userId === userId);
            if (apiKeyIndex === -1) {
                throw new common_1.NotFoundException(`API key with ID ${id} not found`);
            }
            const updatedApiKey = { ...mockApiKeys[apiKeyIndex] };
            if (updateApiKeyDto.name)
                updatedApiKey.name = updateApiKeyDto.name;
            if (updateApiKeyDto.dailyLimit !== undefined)
                updatedApiKey.dailyLimit = updateApiKeyDto.dailyLimit;
            if (updateApiKeyDto.active !== undefined)
                updatedApiKey.active = updateApiKeyDto.active;
            if (updateApiKeyDto.expiresAt)
                updatedApiKey.expiresAt = new Date(updateApiKeyDto.expiresAt);
            updatedApiKey.updatedAt = new Date();
            mockApiKeys[apiKeyIndex] = updatedApiKey;
            return updatedApiKey;
        }
    }
    async remove(id, userId) {
        try {
            await this.findOne(id, userId);
            return await this.prisma.apiKey.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.log('Prisma error, falling back to mock database', error);
            const apiKeyIndex = mockApiKeys.findIndex(k => k.id === id && k.userId === userId);
            if (apiKeyIndex === -1) {
                throw new common_1.NotFoundException(`API key with ID ${id} not found`);
            }
            const removedApiKey = mockApiKeys[apiKeyIndex];
            mockApiKeys.splice(apiKeyIndex, 1);
            return removedApiKey;
        }
    }
    async validateApiKey(key) {
        try {
            const apiKey = await this.prisma.apiKey.findUnique({
                where: { key },
                include: { user: true },
            });
            if (!apiKey) {
                return null;
            }
            if (!apiKey.active) {
                throw new common_1.BadRequestException('API key is inactive');
            }
            if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
                throw new common_1.BadRequestException('API key has expired');
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (apiKey.lastResetDate < today) {
                await this.prisma.apiKey.update({
                    where: { id: apiKey.id },
                    data: {
                        usageCount: 0,
                        lastResetDate: new Date(),
                    },
                });
                apiKey.usageCount = 0;
            }
            if (apiKey.usageCount >= apiKey.dailyLimit) {
                throw new common_1.BadRequestException('API key daily limit exceeded');
            }
            return apiKey;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.log('Prisma error, falling back to mock database', error);
            const apiKey = mockApiKeys.find(k => k.key === key);
            if (!apiKey) {
                return null;
            }
            if (!apiKey.active) {
                throw new common_1.BadRequestException('API key is inactive');
            }
            if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
                throw new common_1.BadRequestException('API key has expired');
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (apiKey.lastResetDate < today) {
                apiKey.usageCount = 0;
                apiKey.lastResetDate = new Date();
            }
            if (apiKey.usageCount >= apiKey.dailyLimit) {
                throw new common_1.BadRequestException('API key daily limit exceeded');
            }
            return apiKey;
        }
    }
    async incrementApiKeyUsage(apiKeyId, endpoint) {
        try {
            await this.prisma.apiKeyUsage.create({
                data: {
                    apiKeyId,
                    endpoint,
                },
            });
            return await this.prisma.apiKey.update({
                where: { id: apiKeyId },
                data: {
                    usageCount: {
                        increment: 1,
                    },
                },
            });
        }
        catch (error) {
            console.log('Prisma error, falling back to mock database', error);
            mockApiKeyUsage.push({
                id: mockApiKeyUsage.length + 1,
                apiKeyId,
                endpoint,
                timestamp: new Date()
            });
            const apiKey = mockApiKeys.find(k => k.id === apiKeyId);
            if (apiKey) {
                apiKey.usageCount += 1;
                apiKey.updatedAt = new Date();
            }
            return apiKey;
        }
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map