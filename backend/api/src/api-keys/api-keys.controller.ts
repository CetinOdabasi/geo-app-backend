import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Put } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MockApiKey } from './api-keys.service';

// DTO'lar için basit arayüzler
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

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  getApiKeysInfo() {
    return {
      name: 'API Keys Management',
      description: 'Endpoints for creating and managing API keys',
      endpoints: {
        '/api/api-keys': 'Get API key management information',
        '/api/api-keys/list': 'List all user API keys (requires authentication)',
        '/api/api-keys/create': 'Create a new API key (requires authentication)',
        '/api/api-keys/:id': 'Get, update, or delete an API key (requires authentication)'
      }
    };
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async list(@Request() req): Promise<MockApiKey[]> {
    return this.apiKeysService.findAll(req.user.id);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createApiKeyDto: CreateApiKeyDto): Promise<MockApiKey> {
    return this.apiKeysService.create(req.user.id, createApiKeyDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string): Promise<MockApiKey> {
    return this.apiKeysService.findOne(+id, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
  ): Promise<MockApiKey> {
    return this.apiKeysService.update(+id, req.user.id, updateApiKeyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string): Promise<MockApiKey> {
    return this.apiKeysService.remove(+id, req.user.id);
  }
}
