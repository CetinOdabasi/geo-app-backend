import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    refreshToken(req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    getAuthInfo(): {
        endpoints: {
            '/api/auth/login': string;
            '/api/auth/register': string;
            '/api/auth/refresh': string;
            '/api/auth/users': string;
        };
    };
    getAllUsers(): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
