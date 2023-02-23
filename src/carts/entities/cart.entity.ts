import { Exclude } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { CartStatus } from '../interfaces/cart-status.enum';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';


@Entity()
export class Cart {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('integer', { name: 'userId', nullable: true })
    userId: number;

    @ManyToOne(() => User, (user) => user.carts, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
    user: User;

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { eager: true })
    cartItems: CartItem[];

    @Column({ type: 'enum', enum: CartStatus, default: CartStatus.CREATED })
    status: CartStatus;

    @Column({ type: 'float', default: 0 })
    subTotalPrice: number;

    @Column({ type: 'float', default: 0 })
    totalTax: number;

    @Column({ type: 'float', default: 0 })
    discountVoucher: number;

    @Column({ type: 'float', default: 0 })
    totalPrice: number;

    @Exclude()
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAte: Date;
}