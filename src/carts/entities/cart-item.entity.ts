

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

import * as mongoose from 'mongoose';
export type CartItemDocument = HydratedDocument<CartItem>;

@Schema({ timestamps: true })
export class CartItem {

    //@Column('objectid')
    //cartId: ObjectID;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    productId: mongoose.Types.ObjectId | string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' })
    cartId: mongoose.Types.ObjectId | string;

    @Prop({ type: 'number' })
    quantity: number;

    @Prop({ type: 'number' })
    price: number;

    @Prop({ type: 'number' })
    subTotalPrice: number;

    @Prop({ type: 'number' })
    discountRate: number;
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem).set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    }
});;