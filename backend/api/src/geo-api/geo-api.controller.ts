import { Controller, Get, Query, Param, UseGuards, Headers } from '@nestjs/common';
import { GeoApiService } from './geo-api.service';

// DTO'lar için basit arayüzler
interface CoordinateDto {
  latitude: number;
  longitude: number;
}

@Controller('geo')
export class GeoApiController {
  constructor(private readonly geoApiService: GeoApiService) {}

  @Get()
  getGeoApiInfo() {
    return {
      name: 'Geo API',
      description: 'Geographic information API',
      endpoints: {
        '/api/geo/coordinates': 'Get location info from coordinates',
        '/api/geo/city/:id': 'Get geo data for a city',
        '/api/geo/geojson': 'Get all cities as GeoJSON'
      }
    };
  }

  @Get('coordinates')
  async getInfoByCoordinates(@Query() coordinateDto: CoordinateDto) {
    return this.geoApiService.getInfoByCoordinates(coordinateDto);
  }

  @Get('city/:id')
  async getCityById(@Param('id') id: string) {
    return this.geoApiService.getCityById(+id);
  }

  @Get('geojson')
  async getCitiesAsGeoJSON() {
    return this.geoApiService.getCitiesAsGeoJSON();
  }
}
