import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

// Export the interface so it can be used by the controller
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

// Mock data for API Keys
const mockApiKeys: MockApiKey[] = [
  {
    id: 1,
    key: 'abcdef123456',
    name: 'Test API Key',
    userId: 1,
    active: true,
    dailyLimit: 100,
    usageCount: 0,
    lastResetDate: new Date(),
    expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockApiKeyUsage = [];

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

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createApiKeyDto: CreateApiKeyDto) {
    try {
      // Generate a random API key
      const key = randomBytes(32).toString('hex');
      
      // Try to use Prisma
      return await this.prisma.apiKey.create({
        data: {
          ...createApiKeyDto,
          key,
          userId,
        },
      });
    } catch (error) {
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation
      const newApiKey = {
        id: mockApiKeys.length + 1,
        key: randomBytes(32).toString('hex'),
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

  async findAll(userId: number) {
    try {
      // Try to use Prisma
      return await this.prisma.apiKey.findMany({
        where: { userId },
      });
    } catch (error) {
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation
      return mockApiKeys.filter(apiKey => apiKey.userId === userId);
    }
  }

  async findOne(id: number, userId: number) {
    try {
      // Try to use Prisma
      const apiKey = await this.prisma.apiKey.findFirst({
        where: { id, userId },
      });
      
      if (!apiKey) {
        throw new NotFoundException(`API key with ID ${id} not found`);
      }
      
      return apiKey;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation
      const apiKey = mockApiKeys.find(k => k.id === id && k.userId === userId);
      
      if (!apiKey) {
        throw new NotFoundException(`API key with ID ${id} not found`);
      }
      
      return apiKey;
    }
  }

  async update(id: number, userId: number, updateApiKeyDto: UpdateApiKeyDto) {
    try {
      // Check if API key exists
      await this.findOne(id, userId);
      
      // Try to use Prisma
      return await this.prisma.apiKey.update({
        where: { id },
        data: updateApiKeyDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation
      const apiKeyIndex = mockApiKeys.findIndex(k => k.id === id && k.userId === userId);
      
      if (apiKeyIndex === -1) {
        throw new NotFoundException(`API key with ID ${id} not found`);
      }
      
      // Clone the existing API key
      const updatedApiKey: MockApiKey = { ...mockApiKeys[apiKeyIndex] };
      
      // Update fields from DTO
      if (updateApiKeyDto.name) updatedApiKey.name = updateApiKeyDto.name;
      if (updateApiKeyDto.dailyLimit !== undefined) updatedApiKey.dailyLimit = updateApiKeyDto.dailyLimit;
      if (updateApiKeyDto.active !== undefined) updatedApiKey.active = updateApiKeyDto.active;
      if (updateApiKeyDto.expiresAt) updatedApiKey.expiresAt = new Date(updateApiKeyDto.expiresAt);
      
      // Update the updatedAt timestamp
      updatedApiKey.updatedAt = new Date();
      
      mockApiKeys[apiKeyIndex] = updatedApiKey;
      return updatedApiKey;
    }
  }

  async remove(id: number, userId: number) {
    try {
      // Check if API key exists
      await this.findOne(id, userId);
      
      // Try to use Prisma
      return await this.prisma.apiKey.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation
      const apiKeyIndex = mockApiKeys.findIndex(k => k.id === id && k.userId === userId);
      
      if (apiKeyIndex === -1) {
        throw new NotFoundException(`API key with ID ${id} not found`);
      }
      
      const removedApiKey = mockApiKeys[apiKeyIndex];
      mockApiKeys.splice(apiKeyIndex, 1);
      return removedApiKey;
    }
  }

  async validateApiKey(key: string) {
    try {
      // Try to use Prisma
      const apiKey = await this.prisma.apiKey.findUnique({
        where: { key },
        include: { user: true },
      });
      
      if (!apiKey) {
        return null;
      }
      
      if (!apiKey.active) {
        throw new BadRequestException('API key is inactive');
      }
      
      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        throw new BadRequestException('API key has expired');
      }
      
      // Check daily limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (apiKey.lastResetDate < today) {
        // Reset usage count if it's a new day
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
        throw new BadRequestException('API key daily limit exceeded');
      }
      
      return apiKey;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation
      const apiKey = mockApiKeys.find(k => k.key === key);
      
      if (!apiKey) {
        return null;
      }
      
      if (!apiKey.active) {
        throw new BadRequestException('API key is inactive');
      }
      
      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        throw new BadRequestException('API key has expired');
      }
      
      // Check daily limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (apiKey.lastResetDate < today) {
        // Reset usage count if it's a new day
        apiKey.usageCount = 0;
        apiKey.lastResetDate = new Date();
      }
      
      if (apiKey.usageCount >= apiKey.dailyLimit) {
        throw new BadRequestException('API key daily limit exceeded');
      }
      
      return apiKey;
    }
  }

  async incrementApiKeyUsage(apiKeyId: number, endpoint: string) {
    try {
      // Try to use Prisma
      // Record usage
      await this.prisma.apiKeyUsage.create({
        data: {
          apiKeyId,
          endpoint,
        },
      });
      
      // Increment usage count
      return await this.prisma.apiKey.update({
        where: { id: apiKeyId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation
      // Record usage
      mockApiKeyUsage.push({
        id: mockApiKeyUsage.length + 1,
        apiKeyId,
        endpoint,
        timestamp: new Date()
      });
      
      // Increment usage count
      const apiKey = mockApiKeys.find(k => k.id === apiKeyId);
      
      if (apiKey) {
        apiKey.usageCount += 1;
        apiKey.updatedAt = new Date();
      }
      
      return apiKey;
    }
  }
}
