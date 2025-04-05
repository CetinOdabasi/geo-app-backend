import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { GeoApiModule } from './geo-api/geo-api.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Global yapılandırma
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Hız sınırlama
    ThrottlerModule.forRoot([{
      name: 'default',
      limit: 10,
      ttl: 60000,
    }]),
    
    // Modüller
    PrismaModule,
    AuthModule,
    ApiKeysModule,
    GeoApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
