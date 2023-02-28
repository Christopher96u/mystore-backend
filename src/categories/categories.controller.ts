import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Role } from 'src/auth/roles/roles.enum';
import { Roles } from 'src/auth/roles/roles.decorator';

@Controller('categories')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthenticationGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }
    @Get()
    @Roles(Role.USER)
    findAll() {
        return this.categoriesService.findAll();

    }

    @Get('/paginate')
    //TODO: Add pagination support
    paginate() {
        console.log('paginate endpoint');
    }

    @Get(':id')
    findOne(@Param('id') id: string) {

        return this.categoriesService.findOne(id);
    }

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto) {

        return this.categoriesService.create(createCategoryDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {

        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    softDelete(@Param('id') id: string) {
        return this.categoriesService.softDelete(id);
    }

    @Delete(':id/hard')
    hardDelete(@Param('id') id: string) {
        return this.categoriesService.hardDelete(id);
    }
}