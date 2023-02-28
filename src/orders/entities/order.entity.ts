import * as mongoose from 'mongoose';
import { Cart } from "src/carts/entities/cart.entity";
import { User } from "src/users/entities/user.entity";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class Order {

    @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
    user: User;

    @Prop({ type: 'string', enum: ['PENDING', 'COMPLETED', 'CANCELLED'], default: 'PENDING' })
    status: string;

    @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' } })
    cart: Cart;
}
export const OrderSchema = SchemaFactory.createForClass(Order);