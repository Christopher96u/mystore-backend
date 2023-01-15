import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { UpdateResult } from 'typeorm';
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
        const hashedPassword = await this.hashData(createUserDto.password);
        // rewrite password field with hash
        const newUser = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return newUser;
    }

    async verifyHashedValue(hashedValue: string, plainValue: string): Promise<boolean> {

        return argon2.verify(hashedValue, plainValue);
    }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }
        const passwordMatches = await this.verifyHashedValue(user.password, password);
        if (!passwordMatches) {
            return null;
        }

        return user;
    }

    async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await this.hashData(refreshToken);
        await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
    }

    async refreshTokens(user: User): Promise<Tokens> {
        const tokens = await this.generateTokens(user.id, user.email, user.roles);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async generateTokens(userId: number, email: string, roles: Role[]): Promise<Tokens> {
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

    async signIn(user: User): Promise<Tokens> {
        const tokens = await this.generateTokens(user.id, user.email, user.roles);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async logout(userId: number): Promise<UpdateResult> {

        const removedToken = await this.usersService.removeRefreshToken(userId);
        if (!removedToken) {
            throw new ForbiddenException('Refresh token not found');
        }

        return removedToken;
    }
}
