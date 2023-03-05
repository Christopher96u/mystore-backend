import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('products')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthenticationGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('search')
    //TODO: Add Search/Pagination support
    search(@Query('term') term: string) {
        console.log(term);
    }

    @Get()
    //@SkipAuth() or
    //@Roles(Role.ADMIN)
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Post()
    create(@Body() createProductDto: CreateProductDto) {

        return this.productsService.create(createProductDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    softDelete(@Param('id') id: string) {
        return this.productsService.softDelete(id);
    }

    @Delete(':id/hard')
    hardDelete(@Param('id') id: string) {
        return this.productsService.hardDelete(id);
    }
}