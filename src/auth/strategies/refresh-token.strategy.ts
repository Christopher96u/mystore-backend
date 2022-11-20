import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWT } from '../interfaces/jwt.interface';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(configService: ConfigService, private readonly authService: AuthService, private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: JWT): Promise<User> {
        if (!payload) {
            throw new BadRequestException('No token in payload');
        }
        const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
        const storedUser = await this.usersService.findOne(payload.sub);
        if (!refreshToken || !storedUser.refreshToken) {
            throw new ForbiddenException('Refresh token not found');
        }
        const refreshTokenMatches = await this.authService.verifyHashedValue(storedUser.refreshToken, refreshToken);
        if (!refreshTokenMatches) {
            throw new ForbiddenException('Refresh token doesnt match');
        }

        return storedUser;
    }
}