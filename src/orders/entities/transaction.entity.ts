import { Exclude } from 'class-transformer';
import { Product } from 'src/products/entities/product.entity';
import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, PrimaryGeneratedColumn, JoinColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { Order } from './order.entity';


@Entity()
export class Transaction {
    //TODO: add some fields to the Transaction entity
    @PrimaryGeneratedColumn()
    id: number;

    @Column('integer', { name: 'userId' })
    userId: number;

    @Column('integer', { name: 'orderId' })
    orderId: number;

    @Exclude()
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAte: Date;

    @ManyToOne(() => Order, (order) => order.transactions, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn([{ name: 'orderId', referencedColumnName: 'id' }])
    order: Order;

    @ManyToOne(() => User, (user) => user.transactions, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
    user: User;
}