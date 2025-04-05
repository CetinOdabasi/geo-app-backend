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
exports.ApiKeysController = void 0;
const common_1 = require("@nestjs/common");
const api_keys_service_1 = require("./api-keys.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ApiKeysController = class ApiKeysController {
    constructor(apiKeysService) {
        this.apiKeysService = apiKeysService;
    }
    getApiKeysInfo() {
        return {
            name: 'API Keys Management',
            description: 'Endpoints for creating and managing API keys',
            endpoints: {
                '/api/api-keys': 'Get API key management information',
                '/api/api-keys/list': 'List all user API keys (requires authentication)',
                '/api/api-keys/create': 'Create a new API key (requires authentication)',
                '/api/api-keys/:id': 'Get, update, or delete an API key (requires authentication)'
            }
        };
    }
    async list(req) {
        return this.apiKeysService.findAll(req.user.id);
    }
    async create(req, createApiKeyDto) {
        return this.apiKeysService.create(req.user.id, createApiKeyDto);
    }
    async findOne(req, id) {
        return this.apiKeysService.findOne(+id, req.user.id);
    }
    async update(req, id, updateApiKeyDto) {
        return this.apiKeysService.update(+id, req.user.id, updateApiKeyDto);
    }
    async remove(req, id) {
        return this.apiKeysService.remove(+id, req.user.id);
    }
};
exports.ApiKeysController = ApiKeysController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiKeysController.prototype, "getApiKeysInfo", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "remove", null);
exports.ApiKeysController = ApiKeysController = __decorate([
    (0, common_1.Controller)('api-keys'),
    __metadata("design:paramtypes", [api_keys_service_1.ApiKeysService])
], ApiKeysController);
//# sourceMappingURL=api-keys.controller.js.map