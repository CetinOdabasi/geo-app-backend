import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    // The JWT Guard already validated the token
    // Just return a new token for the authenticated user
    return this.authService.generateTokenForUser(req.user);
  }

  @Get()
  getAuthInfo() {
    return {
      endpoints: {
        '/api/auth/login': 'Login with email and password',
        '/api/auth/register': 'Register a new user',
        '/api/auth/refresh': 'Refresh JWT token (requires valid token)',
        '/api/auth/users': 'List all users (only for testing)',
      }
    };
  }

  @Get('users')
  async getAllUsers() {
    console.log('Retrieving all users...');
    const users = await this.authService.getAllUsers();
    console.log('Users retrieved:', users);
    return users;
  }
}
