import { Exclude } from 'class-transformer';
import { Product } from 'src/products/entities/product.entity';
import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, PrimaryGeneratedColumn, JoinColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { OrderItem } from './order-item.entity';
import { Transaction } from './transaction.entity';


@Entity()
export class Order {
    //TODO: add order status ENUM, and add some fields to the order entity
    @PrimaryGeneratedColumn()
    id: number;

    @Column('integer', { name: 'userId', nullable: true })
    userId: number;

    @Exclude()
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAte: Date;

    @ManyToOne(() => User, (user) => user.orders, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
    user: User;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    orderItems: OrderItem[];

    @OneToMany(() => Transaction, transaction => transaction.order)
    transactions: Transaction[];
}