import { Exclude } from 'class-transformer';
import { Product } from 'src/products/entities/product.entity';
import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, PrimaryGeneratedColumn, JoinColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { Order } from './order.entity';


@Entity()
export class OrderItem {
    //TODO: add some fields to the orderItem entity
    @PrimaryGeneratedColumn()
    id: number;

    @Column('integer', { name: 'productId' })
    productId: number;

    @Column('integer', { name: 'orderId' })
    orderId: number;

    @Exclude()
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAte: Date;

    @ManyToOne(() => Order, (order) => order.orderItems, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn([{ name: 'orderId', referencedColumnName: 'id' }])
    order: Order;

    @ManyToOne(() => Product, (product) => product.orderItems, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn([{ name: 'productId', referencedColumnName: 'id' }])
    product: Product;
}