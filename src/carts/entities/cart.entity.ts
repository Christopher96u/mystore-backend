
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

import * as mongoose from 'mongoose';
import { Order } from "src/orders/entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { CartStatus } from "../interfaces/cart-status.enum";
import { CartItem } from "./cart-item.entity";
export type CartDocument = HydratedDocument<Cart>;

@Schema()
export class Cart {
    // Change to just store userId
    @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
    user: User;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }] })
    cartItems: CartItem[];

    @Prop({ type: 'string', default: CartStatus.CREATED })
    status: CartStatus;

    @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' } })
    order: Order;

    @Prop({ type: 'number', default: 0 })
    subTotalPrice: number;

    @Prop({ type: 'number', default: 0 })
    totalTax: number;

    @Prop({ type: 'number', default: 0 })
    discountVoucher: number;

    @Prop({ type: 'number', default: 0 })
    totalPrice: number;
}
export const CartSchema = SchemaFactory.createForClass(Cart);