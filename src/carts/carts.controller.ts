import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CartsService } from './carts.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { RequestWithUser } from 'src/auth/interfaces/reques-with-user.interface';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';



@Controller('cart')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthenticationGuard)
export class CartsController {
    constructor(private readonly cartService: CartsService) { }
    @Post()
    add(@Body() createCartItemDto: CreateCartItemDto, @Req() req: RequestWithUser) {

        // return this.cartService.addItem(createCartItemDto, req.user.id);
    }

    @Get()
    findCurrentCart(@Req() req: RequestWithUser) {

        //return this.cartService.findCartByUserId(req.user.id);
    }

    @Delete()
    removeItem(@Body() removeCartItemDto: RemoveCartItemDto, @Req() req: RequestWithUser) {

        //return this.cartService.removeItem(removeCartItemDto.cartItemId, req.user.id);
    }
}
