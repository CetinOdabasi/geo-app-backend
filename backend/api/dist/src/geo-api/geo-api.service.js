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
exports.GeoApiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
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
let GeoApiService = class GeoApiService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInfoByCoordinates(coordinateDto) {
        const { latitude, longitude } = coordinateDto;
        if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
            throw new common_1.NotFoundException('Invalid coordinates. Latitude must be between -90 and 90, and longitude must be between -180 and 180.');
        }
        try {
            const result = await this.prisma.$queryRaw `
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
                throw new common_1.NotFoundException('No location found for the provided coordinates');
            }
            return result[0];
        }
        catch (error) {
            console.log('Prisma error, falling back to mock database', error);
            function haversineDistance(lat1, lon1, lat2, lon2) {
                const R = 6371;
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            }
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
            if (!closestCity) {
                throw new common_1.NotFoundException('No location found for the provided coordinates');
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
    async getCityById(id) {
        try {
            const city = await this.prisma.city.findUnique({
                where: { id },
                include: {
                    country: true,
                },
            });
            if (!city) {
                throw new common_1.NotFoundException(`City with ID ${id} not found`);
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
                location: city.location && city.location.coordinates
                    ? {
                        latitude: city.location.coordinates[1],
                        longitude: city.location.coordinates[0]
                    }
                    : { latitude: 0, longitude: 0 },
                timezone: city.timezone,
                postalCodes: city.postalCodes,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.log('Prisma error, falling back to mock database', error);
            const city = mockCities.find(c => c.id === id);
            if (!city) {
                throw new common_1.NotFoundException(`City with ID ${id} not found`);
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
            const cities = await this.prisma.city.findMany({
                include: {
                    country: true,
                },
            });
            return this.convertToGeoJSON(cities);
        }
        catch (error) {
            console.log('Prisma error, falling back to mock database', error);
            return this.convertToGeoJSON(mockCities);
        }
    }
};
exports.GeoApiService = GeoApiService;
exports.GeoApiService = GeoApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GeoApiService);
//# sourceMappingURL=geo-api.service.js.map