
import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {
        super({
            usernameField: 'email',
        });
    }

    async validate(email: string, password: string): Promise<User> {
        const storedUser = await this.usersService.findByEmail(email);
        if (!storedUser) {
            throw new BadRequestException(`User with email ${email} does not exist`);
        }
        const passwordMatches = await this.authService.verifyHashedValue(storedUser.password, password);
        if (!passwordMatches) {
            throw new BadRequestException('Password is incorrect. Try again');
        }

        return storedUser;
    }
}