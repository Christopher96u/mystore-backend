

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

import * as mongoose from 'mongoose';
export type CartItemDocument = HydratedDocument<CartItem>;

@Schema()
export class CartItem {

    //@Column('objectid')
    //cartId: ObjectID;

    @Prop({ type: 'number' })
    quantity: number;

    @Prop({ type: 'decimal', precision: 5, scale: 2 })
    price: number;

    @Prop({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    subTotalPrice: number;

    @Prop({ type: 'decimal', precision: 2, scale: 2, default: 0 })
    discountRate: number;
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);