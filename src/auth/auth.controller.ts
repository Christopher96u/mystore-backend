import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @SkipAuth()
  @Post('signup')
  signUp(@Body() createUser: CreateUserDto) {

    return this.authService.signUp(createUser);
  }

  @SkipAuth()
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signIn(@Request() req) {

    return this.authService.signIn(req.user);
  }

  @Post('logout')
  logout(@Request() req) {

    return this.authService.logout(req.user.id);
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  refreshTokens(@Request() req) {

    return this.authService.refreshTokens(req.user);
  }
}
