import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/auth.dto';
import { Role } from './roles/roles.enum';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService) { }

    async hashData(data: string): Promise<string> {

        return argon2.hash(data);
    }

    async signUp(createUserDto: CreateUserDto): Promise<User> {
        const storedUser = await this.usersService.findByEmail(
            createUserDto.email,
        );
        if (storedUser) {
            throw new BadRequestException('User already exists');
        }
        // Hash password
        const hashedPassword = await this.hashData(createUserDto.password);
        // rewrite password field with hash
        const newUser = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return newUser;
    }

    async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await this.hashData(refreshToken);
        await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
    }

    async refreshTokens(userId: number, refreshToken: string) {
        const user = await this.usersService.findOne(userId);
        if (!user || !user.refreshToken) {
            throw new ForbiddenException('Access Denied');
        }
        const refreshTokenMatches = await argon2.verify(
            user.refreshToken,
            refreshToken,
        );
        if (!refreshTokenMatches) {
            throw new ForbiddenException('Access Denied');
        }
        const tokens = await this.getTokens(user.id, user.email, user.roles);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async getTokens(userId: number, email: string, roles: Role[]): Promise<Tokens> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                    roles,
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: this.configService.get<string>('JWT_ACCESS_SECRET_EXPIRES_IN'),
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                    roles,
                },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: this.configService.get<string>('JWT_REFRESH_SECRET_EXPIRES_IN'),
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async signIn(user: AuthDto): Promise<Tokens> {
        // Check if user exists
        const storedUser = await this.usersService.findByEmail(user.email);
        if (!storedUser) {
            throw new BadRequestException('User does not exist');
        }
        const passwordMatches = await argon2.verify(storedUser.password, user.password);
        if (!passwordMatches) {
            throw new BadRequestException('Password is incorrect');
        }
        const tokens = await this.getTokens(storedUser.id, storedUser.email, storedUser.roles);
        await this.updateRefreshToken(storedUser.id, tokens.refreshToken);

        return tokens;
    }

    async logout(userId: number): Promise<void> {

        return this.usersService.removeRefreshToken(userId);
    }
}
