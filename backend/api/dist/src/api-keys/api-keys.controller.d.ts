import { ApiKeysService } from './api-keys.service';
import { MockApiKey } from './api-keys.service';
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
export declare class ApiKeysController {
    private readonly apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    getApiKeysInfo(): {
        name: string;
        description: string;
        endpoints: {
            '/api/api-keys': string;
            '/api/api-keys/list': string;
            '/api/api-keys/create': string;
            '/api/api-keys/:id': string;
        };
    };
    list(req: any): Promise<MockApiKey[]>;
    create(req: any, createApiKeyDto: CreateApiKeyDto): Promise<MockApiKey>;
    findOne(req: any, id: string): Promise<MockApiKey>;
    update(req: any, id: string, updateApiKeyDto: UpdateApiKeyDto): Promise<MockApiKey>;
    remove(req: any, id: string): Promise<MockApiKey>;
}
export {};
