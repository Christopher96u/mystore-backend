
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

import * as mongoose from 'mongoose';
import { Order } from "src/orders/entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { CartStatus } from "../interfaces/cart-status.enum";
import { CartItem, CartItemDocument } from "./cart-item.entity";
export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
    // Change to just store userId
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User | mongoose.Types.ObjectId;

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }])
    cartItems: CartItemDocument[];

    @Prop({ type: 'string', default: CartStatus.CREATED })
    status: CartStatus;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
    order: Order;

    @Prop({ type: 'number', default: 0 })
    subTotalPrice: number;

    @Prop({ type: 'number', default: 0 })
    totalTax: number;

    @Prop({ type: 'number', default: 0 })
    discountVoucher: number;

    @Prop({ type: 'number', default: 0 })
    totalPrice: number;

    @Prop({ type: 'boolean', default: false })
    isDeleted: boolean;
}
export const CartSchema = SchemaFactory.createForClass(Cart).set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.isDeleted;
        return ret;
    }
});