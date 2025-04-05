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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoApiController = void 0;
const common_1 = require("@nestjs/common");
const geo_api_service_1 = require("./geo-api.service");
let GeoApiController = class GeoApiController {
    constructor(geoApiService) {
        this.geoApiService = geoApiService;
    }
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
    async getInfoByCoordinates(coordinateDto) {
        return this.geoApiService.getInfoByCoordinates(coordinateDto);
    }
    async getCityById(id) {
        return this.geoApiService.getCityById(+id);
    }
    async getCitiesAsGeoJSON() {
        return this.geoApiService.getCitiesAsGeoJSON();
    }
};
exports.GeoApiController = GeoApiController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GeoApiController.prototype, "getGeoApiInfo", null);
__decorate([
    (0, common_1.Get)('coordinates'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GeoApiController.prototype, "getInfoByCoordinates", null);
__decorate([
    (0, common_1.Get)('city/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeoApiController.prototype, "getCityById", null);
__decorate([
    (0, common_1.Get)('geojson'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeoApiController.prototype, "getCitiesAsGeoJSON", null);
exports.GeoApiController = GeoApiController = __decorate([
    (0, common_1.Controller)('geo'),
    __metadata("design:paramtypes", [geo_api_service_1.GeoApiService])
], GeoApiController);
//# sourceMappingURL=geo-api.controller.js.map