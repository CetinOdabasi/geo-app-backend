import { PrismaService } from '../prisma/prisma.service';
interface CoordinateDto {
    latitude: number;
    longitude: number;
}
export declare class GeoApiService {
    private prisma;
    constructor(prisma: PrismaService);
    getInfoByCoordinates(coordinateDto: CoordinateDto): Promise<any>;
    getCityById(id: number): Promise<{
        id: number;
        name: string;
        country: {
            id: number;
            name: string;
            code: string;
        };
        population: number;
        location: {
            latitude: any;
            longitude: any;
        };
        timezone: string;
        postalCodes: string[];
    }>;
    convertToGeoJSON(cities: any): {
        type: string;
        features: any;
    };
    getCitiesAsGeoJSON(): Promise<{
        type: string;
        features: any;
    }>;
}
export {};
