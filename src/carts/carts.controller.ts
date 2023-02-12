import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CartsService } from './carts.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { RequestWithUser } from 'src/auth/interfaces/reques-with-user.interface';



@Controller('cart')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthenticationGuard)
export class CartsController {
    constructor(private readonly cartService: CartsService) { }
    @Post()
    add(@Body() createCartItemDto: CreateCartItemDto, @Req() req: RequestWithUser) {

        return this.cartService.add(createCartItemDto, req.user.id);
    }

    @Get()
    findOne(@Req() req: RequestWithUser) {

        return this.cartService.findOne(req.user.id);
    }
}
