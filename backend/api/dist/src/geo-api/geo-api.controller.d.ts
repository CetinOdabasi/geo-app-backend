import { GeoApiService } from './geo-api.service';
interface CoordinateDto {
    latitude: number;
    longitude: number;
}
export declare class GeoApiController {
    private readonly geoApiService;
    constructor(geoApiService: GeoApiService);
    getGeoApiInfo(): {
        name: string;
        description: string;
        endpoints: {
            '/api/geo/coordinates': string;
            '/api/geo/city/:id': string;
            '/api/geo/geojson': string;
        };
    };
    getInfoByCoordinates(coordinateDto: CoordinateDto): Promise<any>;
    getCityById(id: string): Promise<{
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
    getCitiesAsGeoJSON(): Promise<{
        type: string;
        features: any;
    }>;
}
export {};
