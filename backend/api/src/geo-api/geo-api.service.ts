import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Mock city data
const mockCities = [
  {
    id: 1,
    name: 'Istanbul',
    countryId: 1,
    population: 15462452,
    location: { type: 'Point', coordinates: [29.0277, 41.0135] },
    timezone: 'Europe/Istanbul',
    postalCodes: ['34000', '34100', '34200'],
    createdAt: new Date(),
    updatedAt: new Date(),
    country: {
      id: 1,
      name: 'Turkey',
      code: 'TR',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 2,
    name: 'Ankara',
    countryId: 1,
    population: 5663322,
    location: { type: 'Point', coordinates: [32.8597, 39.9334] },
    timezone: 'Europe/Istanbul',
    postalCodes: ['06000', '06100', '06200'],
    createdAt: new Date(),
    updatedAt: new Date(),
    country: {
      id: 1,
      name: 'Turkey',
      code: 'TR',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 3,
    name: 'New York',
    countryId: 2,
    population: 8804190,
    location: { type: 'Point', coordinates: [-74.0060, 40.7128] },
    timezone: 'America/New_York',
    postalCodes: ['10001', '10002', '10003'],
    createdAt: new Date(),
    updatedAt: new Date(),
    country: {
      id: 2,
      name: 'United States',
      code: 'US',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];

interface CoordinateDto {
  latitude: number;
  longitude: number;
}

@Injectable()
export class GeoApiService {
  constructor(private prisma: PrismaService) {}

  async getInfoByCoordinates(coordinateDto: CoordinateDto) {
    const { latitude, longitude } = coordinateDto;
    
    // Validate coordinate ranges
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new NotFoundException('Invalid coordinates. Latitude must be between -90 and 90, and longitude must be between -180 and 180.');
    }
    
    try {
      // Try to use Prisma with real database
      const result = await this.prisma.$queryRaw`
        SELECT 
          c.id as "cityId", 
          c.name as "cityName", 
          co.id as "countryId", 
          co.name as "countryName", 
          co.code as "countryCode",
          c.timezone
        FROM "City" c
        JOIN "Country" co ON c.country_id = co.id
        WHERE ST_DWithin(
          c.location, 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
          0.1
        )
        ORDER BY ST_Distance(
          c.location, 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        )
        LIMIT 1;
      `;
      
      if (!result || (Array.isArray(result) && result.length === 0)) {
        throw new NotFoundException('No location found for the provided coordinates');
      }
      
      return result[0];
    } catch (error) {
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation - calculate distance using Haversine formula
      function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c;
      }
      
      // Find the closest city
      let closestCity = null;
      let minDistance = Infinity;
      
      for (const city of mockCities) {
        const cityLat = city.location.coordinates[1];
        const cityLon = city.location.coordinates[0];
        const distance = haversineDistance(latitude, longitude, cityLat, cityLon);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }
      
      // Always return the closest city, but add distance information
      if (!closestCity) {
        throw new NotFoundException('No location found for the provided coordinates');
      }
      
      return {
        id: closestCity.id,
        name: closestCity.name,
        country: closestCity.country.name,
        coordinates: {
          latitude: closestCity.location.coordinates[1],
          longitude: closestCity.location.coordinates[0]
        },
        distance: Math.round(minDistance),
        population: closestCity.population,
        timezone: closestCity.timezone
      };
    }
  }

  async getCityById(id: number) {
    try {
      // Try to use Prisma
      const city = await this.prisma.city.findUnique({
        where: { id },
        include: {
          country: true,
        },
      });
      
      if (!city) {
        throw new NotFoundException(`City with ID ${id} not found`);
      }
      
      return {
        id: city.id,
        name: city.name,
        country: {
          id: city.country.id,
          name: city.country.name,
          code: city.country.code,
        },
        population: city.population,
        location: (city as any).location && (city as any).location.coordinates 
          ? {
              latitude: (city as any).location.coordinates[1],
              longitude: (city as any).location.coordinates[0]
            }
          : { latitude: 0, longitude: 0 },
        timezone: city.timezone,
        postalCodes: city.postalCodes,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation
      const city = mockCities.find(c => c.id === id);
      
      if (!city) {
        throw new NotFoundException(`City with ID ${id} not found`);
      }
      
      return {
        id: city.id,
        name: city.name,
        country: {
          id: city.country.id,
          name: city.country.name,
          code: city.country.code,
        },
        population: city.population,
        location: {
          latitude: city.location.coordinates[1],
          longitude: city.location.coordinates[0]
        },
        timezone: city.timezone,
        postalCodes: city.postalCodes,
      };
    }
  }

  // GeoJSON destek işlevi
  convertToGeoJSON(cities) {
    return {
      type: 'FeatureCollection',
      features: cities.map(city => ({
        type: 'Feature',
        geometry: city.location,
        properties: {
          id: city.id,
          name: city.name,
          countryName: city.country.name,
          countryCode: city.country.code,
          population: city.population,
          timezone: city.timezone
        }
      }))
    };
  }

  async getCitiesAsGeoJSON() {
    try {
      // Try to use Prisma
      const cities = await this.prisma.city.findMany({
        include: {
          country: true,
        },
      });
      
      return this.convertToGeoJSON(cities);
    } catch (error) {
      console.log('Prisma error, falling back to mock database', error);
      
      // Mock implementation
      return this.convertToGeoJSON(mockCities);
    }
  }
}
