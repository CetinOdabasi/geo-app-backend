import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

// Mock database for development
const mockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password: '$2b$10$bL5SsQ3DeB5yTyGBs90noO.j/o8u5dJdcvMbFQwKAz.xeEKIBkBMm', // "password123"
    name: 'Admin User',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    email: 'user@example.com',
    password: '$2b$10$bL5SsQ3DeB5yTyGBs90noO.j/o8u5dJdcvMbFQwKAz.xeEKIBkBMm', // "password123"
    name: 'Test User',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    // Log all mock users on service initialization
    console.log('\n===== MOCK USERS FOR TESTING =====');
    mockUsers.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
    });
    console.log('====================================\n');
  }

  async validateUser(email: string, password: string): Promise<any> {
    let user = null;
    
    try {
      // Try to use Prisma first
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
        } catch (bcryptError) {
          console.error('Bcrypt error when comparing password for Prisma user:', bcryptError);
        }
      }
    } catch (error) {
      console.error('Prisma error details:', error);
      console.log('Falling back to mock database');
    }
    
    // If we get here, either there was a Prisma error or the user wasn't found in the database
    // Fall back to mock database
    try {
      const mockUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (mockUser) {
        try {
          const isPasswordValid = await bcrypt.compare(password, mockUser.password);
          if (isPasswordValid) {
            console.log(`Successfully authenticated mock user: ${mockUser.email}`);
            const { password, ...result } = mockUser;
            return result;
          } else {
            console.log(`Password mismatch for mock user: ${mockUser.email}`);
          }
        } catch (bcryptError) {
          console.error('Bcrypt error when comparing password for mock user:', bcryptError);
        }
      } else {
        console.log(`No mock user found with email: ${email}`);
      }
    } catch (error) {
      console.error('Error validating against mock database:', error);
    }
    
    // If we get here, the user wasn't found in either database or the password didn't match
    return null;
  }

  async login(loginDto: LoginDto) {
    console.log(`Login attempt for user: ${loginDto.email}`);
    
    try {
      // Normalize email to lowercase
      const normalizedEmail = loginDto.email.toLowerCase();
      const user = await this.validateUser(normalizedEmail, loginDto.password);
      
      if (!user) {
        console.log(`Login failed for user ${loginDto.email}: Invalid credentials`);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      console.log(`User logged in successfully: ${loginDto.email} (ID: ${user.id})`);
      
      // Create token response
      const tokenResponse = this.generateTokenForUser(user);
      console.log(`Token generated successfully for user ${loginDto.email}`);
      
      return tokenResponse;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error(`Unexpected error during login for ${loginDto.email}:`, error);
      throw new UnauthorizedException('Login failed due to an unexpected error');
    }
  }

  // Generate tokens for authenticated user
  generateTokenForUser(user: any) {
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

  async register(createUserDto: CreateUserDto) {
    console.log(`Registration attempt for email: ${createUserDto.email}`);
    
    // Normalize email to lowercase
    createUserDto.email = createUserDto.email.toLowerCase();
    
    try {
      // Try to use Prisma first
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });
      
      if (existingUser) {
        console.log(`Registration failed: Email already in use - ${createUserDto.email}`);
        throw new ConflictException('Email already in use');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      // Create user
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
      
      console.log(`User registered successfully via Prisma: ${user.email} (ID: ${user.id})`);
      
      // Remove password from response
      const { password, ...result } = user;
      
      // Generate token for the newly registered user
      return this.generateTokenForUser(result);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      console.error('Prisma error details:', error);
      console.log('Falling back to mock database for registration');
      
      // Fall back to mock database
      try {
        // Check again with case-insensitive comparison
        const existingUser = mockUsers.find(u => u.email.toLowerCase() === createUserDto.email.toLowerCase());
        
        if (existingUser) {
          console.log(`Registration failed: Email already in use in mock DB - ${createUserDto.email}`);
          throw new ConflictException('Email already in use');
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        
        // Create user with unique id
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
        
        // Remove password from response
        const { password, ...result } = newUser;
        
        // Log all mock users after adding new one
        console.log('\n===== UPDATED MOCK USERS =====');
        mockUsers.forEach(user => {
          console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
        });
        console.log('============================\n');
        
        return this.generateTokenForUser(result);
      } catch (mockError) {
        if (mockError instanceof ConflictException) {
          throw mockError;
        }
        console.error('Failed to register user in mock database:', mockError);
        throw new Error('Failed to register user');
      }
    }
  }

  // Method to get all users (for testing purposes)
  async getAllUsers() {
    try {
      // Try to use Prisma first
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
    } catch (error) {
      console.log('Prisma error, falling back to mock database', error);
      // Return mock users without passwords
      return mockUsers.map(({ password, ...user }) => user);
    }
  }
}
