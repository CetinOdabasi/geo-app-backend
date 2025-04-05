import { Module } from '@nestjs/common';
import { GeoApiService } from './geo-api.service';
import { GeoApiController } from './geo-api.controller';

@Module({
  providers: [GeoApiService],
  controllers: [GeoApiController]
})
export class GeoApiModule {}
