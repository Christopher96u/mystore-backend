import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWT } from '../interfaces/jwt.interface';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(configService: ConfigService, private readonly authService: AuthService, private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: configService.get('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
            ignoreExpiration: true,
        });
    }

    async validate(req: Request, payload: JWT): Promise<User> {
        if (!payload) {
            throw new BadRequestException('No payload');
        }
        const refreshToken = req.body.refreshToken;
        const storedUser = await this.usersService.findOne(payload.sub);
        if (!refreshToken || !storedUser.refreshToken) {
            throw new ForbiddenException('Refresh token not found');
        }
        const refreshTokenMatches = await this.authService.verifyHashedValue(storedUser.refreshToken, refreshToken);
        if (!refreshTokenMatches) {
            throw new ForbiddenException('Refresh token doesnt match');
        }
        if (payload.exp < (Date.now() / 1000)) {
            throw new UnauthorizedException('REFRESH TOKEN EXPIRED');
        }

        return storedUser;
    }
}