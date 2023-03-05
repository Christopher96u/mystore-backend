import { Category } from '../../categories/entities/category.entity';
import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {

    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop({ type: 'number', default: 0 })
    price: number;

    @Prop({ type: 'number', default: 0 })
    discountRate: number;

    @Prop({ type: 'number' })
    stock: number;

    @Prop({ type: 'boolean', default: true })
    isActive: boolean;

    @Prop({ type: 'boolean', default: false })
    isDeleted: boolean;

    @Prop()
    imageUrl: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
    category: Category | mongoose.Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product).set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.isDeleted;
        return ret;
    }
});