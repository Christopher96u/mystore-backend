import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { SkipAuth } from 'src/auth/decorators/skip-auth.decorator';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Role } from 'src/auth/roles/roles.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RequestWithUser } from 'src/auth/interfaces/reques-with-user.interface';
@Controller('products')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthenticationGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('search')
    //@Roles(Role.USER) doesnt affect. Every endpoint is protected with Role.USER by default
    search(@Query('term') term: string) {
        console.log('call search')
        return this.productsService.search(term);
    }

    @Get()
    //@SkipAuth() or
    //@Roles(Role.ADMIN)
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    //@Roles(Role.USER) doesnt affect. Every endpoint is protected with Role.USER by default
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Post()
    create(@Body() createProductDto: CreateProductDto, @Req() req: RequestWithUser) {
        //TODO: Possibly, we can remove this parameter and remove the userId field from the table
        return this.productsService.create(createProductDto, req.user.id);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}