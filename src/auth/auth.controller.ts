import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUser } from './interfaces/reques-with-user.interface';
import { ObjectID } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  signUp(@Body() createUser: CreateUserDto) {

    return this.authService.signUp(createUser);
  }

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signIn(@Req() req: RequestWithUser) {

    return this.authService.signIn(req.user);
  }

  @Post('logout')
  @UseGuards(JwtAuthenticationGuard)
  logout(@Req() req: RequestWithUser) {

    return this.authService.logout(req.user.id);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  refreshTokens(@Req() req: RequestWithUser) {

    return this.authService.refreshTokens(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthenticationGuard)
  getCurrentUser(@Req() req: RequestWithUser) {

    return this.authService.getCurrentUser(req.user.id);
  }
}
