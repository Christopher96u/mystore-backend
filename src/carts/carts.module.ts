import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Cart, CartSchema } from './entities/cart.entity';
import { CartItem, CartItemSchema } from './entities/cart-item.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from 'src/products/products.service';
import { ProductsModule } from 'src/products/products.module';


@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Cart.name,
      schema: CartSchema
    },
    {
      name: CartItem.name,
      schema: CartItemSchema
    }
    ]),
    ProductsModule
  ],
  providers: [CartsService],
  controllers: [CartsController]
})
export class CartsModule { }
