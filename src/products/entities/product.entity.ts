import { Category } from '../../categories/entities/category.entity';
import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {

    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    price: number;

    @Prop({ type: 'decimal', precision: 2, scale: 2, default: 0 })
    discountRate: number;

    @Prop({ type: 'number' })
    stock: number;

    @Prop({ type: 'boolean', default: true })
    isActive: boolean;

    @Prop()
    imageUrl: string;

    @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' } })
    category: Category;
}

export const ProductSchema = SchemaFactory.createForClass(Product);