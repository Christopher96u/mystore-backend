import { Module } from '@nestjs/common';
import { Order, OrderSchema } from './entities/order.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: Order.name,
            schema: OrderSchema,
        }]),
    ],
})
export class OrdersModule { }
