import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import { HydratedDocument } from "mongoose";
import { Role } from "src/auth/roles/roles.enum";
import { Cart } from "src/carts/entities/cart.entity";
import * as mongoose from 'mongoose';
export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {

    @Prop()
    email: string

    @Prop()
    name: string

    @Prop()
    password: string

    @Prop({ default: null })
    @Exclude()
    refreshToken: string

    @Prop({ type: [{ type: String, enum: Role }], default: [Role.USER] })
    roles: Role[]

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }] })
    carts: Cart[]

    @Prop({ type: 'boolean', default: false })
    isDeleted: boolean

    @Prop({ type: 'boolean', default: true })
    isActive: boolean

    //@Column()
    //orders: Order[]

}
export const UserSchema = SchemaFactory.createForClass(User).set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    }
});
