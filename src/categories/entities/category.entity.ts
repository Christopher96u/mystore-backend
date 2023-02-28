import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {


    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    imageUrl: string;

    @Prop({ type: 'boolean', default: true })
    isActive: boolean;

    @Prop({ type: 'boolean', default: false })
    isDeleted: boolean;
}
export const CategorySchema = SchemaFactory.createForClass(Category).set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    }
});