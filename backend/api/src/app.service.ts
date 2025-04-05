import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      name: 'Geo API Server',
      version: '1.0.0',
      description: 'A geographic information API server built with NestJS, PostgreSQL and PostGIS',
      endpoints: {
        '/api/auth': 'Authentication endpoints',
        '/api/api-keys': 'API key management',
        '/api/geo': 'Geographic data endpoints'
      }
    };
  }
}
