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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const mockUsers = [
    {
        id: 1,
        email: 'admin@example.com',
        password: '$2b$10$bL5SsQ3DeB5yTyGBs90noO.j/o8u5dJdcvMbFQwKAz.xeEKIBkBMm',
        name: 'Admin User',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        email: 'user@example.com',
        password: '$2b$10$bL5SsQ3DeB5yTyGBs90noO.j/o8u5dJdcvMbFQwKAz.xeEKIBkBMm',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        console.log('\n===== MOCK USERS FOR TESTING =====');
        mockUsers.forEach(user => {
            console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
        });
        console.log('====================================\n');
    }
    async validateUser(email, password) {
        let user = null;
        try {
            user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (user) {
                try {
                    const isPasswordValid = await bcrypt.compare(password, user.password);
                    if (isPasswordValid) {
                        const { password, ...result } = user;
                        return result;
                    }
                }
                catch (bcryptError) {
                    console.error('Bcrypt error when comparing password for Prisma user:', bcryptError);
                }
            }
        }
        catch (error) {
            console.error('Prisma error details:', error);
            console.log('Falling back to mock database');
        }
        try {
            const mockUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (mockUser) {
                try {
                    const isPasswordValid = await bcrypt.compare(password, mockUser.password);
                    if (isPasswordValid) {
                        console.log(`Successfully authenticated mock user: ${mockUser.email}`);
                        const { password, ...result } = mockUser;
                        return result;
                    }
                    else {
                        console.log(`Password mismatch for mock user: ${mockUser.email}`);
                    }
                }
                catch (bcryptError) {
                    console.error('Bcrypt error when comparing password for mock user:', bcryptError);
                }
            }
            else {
                console.log(`No mock user found with email: ${email}`);
            }
        }
        catch (error) {
            console.error('Error validating against mock database:', error);
        }
        return null;
    }
    async login(loginDto) {
        console.log(`Login attempt for user: ${loginDto.email}`);
        try {
            const normalizedEmail = loginDto.email.toLowerCase();
            const user = await this.validateUser(normalizedEmail, loginDto.password);
            if (!user) {
                console.log(`Login failed for user ${loginDto.email}: Invalid credentials`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            console.log(`User logged in successfully: ${loginDto.email} (ID: ${user.id})`);
            const tokenResponse = this.generateTokenForUser(user);
            console.log(`Token generated successfully for user ${loginDto.email}`);
            return tokenResponse;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            console.error(`Unexpected error during login for ${loginDto.email}:`, error);
            throw new common_1.UnauthorizedException('Login failed due to an unexpected error');
        }
    }
    generateTokenForUser(user) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
    async register(createUserDto) {
        console.log(`Registration attempt for email: ${createUserDto.email}`);
        createUserDto.email = createUserDto.email.toLowerCase();
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: createUserDto.email },
            });
            if (existingUser) {
                console.log(`Registration failed: Email already in use - ${createUserDto.email}`);
                throw new common_1.ConflictException('Email already in use');
            }
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: hashedPassword,
                },
            });
            console.log(`User registered successfully via Prisma: ${user.email} (ID: ${user.id})`);
            const { password, ...result } = user;
            return this.generateTokenForUser(result);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            console.error('Prisma error details:', error);
            console.log('Falling back to mock database for registration');
            try {
                const existingUser = mockUsers.find(u => u.email.toLowerCase() === createUserDto.email.toLowerCase());
                if (existingUser) {
                    console.log(`Registration failed: Email already in use in mock DB - ${createUserDto.email}`);
                    throw new common_1.ConflictException('Email already in use');
                }
                const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
                const newId = mockUsers.length > 0
                    ? Math.max(...mockUsers.map(u => u.id)) + 1
                    : 1;
                const newUser = {
                    id: newId,
                    email: createUserDto.email,
                    password: hashedPassword,
                    name: createUserDto.name || 'User',
                    role: createUserDto.role || 'USER',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                mockUsers.push(newUser);
                console.log(`User registered successfully in mock DB: ${newUser.email} (ID: ${newUser.id})`);
                const { password, ...result } = newUser;
                console.log('\n===== UPDATED MOCK USERS =====');
                mockUsers.forEach(user => {
                    console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
                });
                console.log('============================\n');
                return this.generateTokenForUser(result);
            }
            catch (mockError) {
                if (mockError instanceof common_1.ConflictException) {
                    throw mockError;
                }
                console.error('Failed to register user in mock database:', mockError);
                throw new Error('Failed to register user');
            }
        }
    }
    async getAllUsers() {
        try {
            const users = await this.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return users;
        }
        catch (error) {
            console.log('Prisma error, falling back to mock database', error);
            return mockUsers.map(({ password, ...user }) => user);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map