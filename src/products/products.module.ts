
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { Product } from './entities/product.entity';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
    imports: [TypeOrmModule.forFeature([Product]), CategoriesModule],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule { }