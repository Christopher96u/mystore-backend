import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Cart } from './entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductsModule } from 'src/products/products.module';


@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User]), ProductsModule],
  providers: [CartsService],
  controllers: [CartsController]
})
export class CartsModule { }
