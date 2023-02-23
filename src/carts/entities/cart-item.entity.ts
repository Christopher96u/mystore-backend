import { Exclude } from 'class-transformer';
import { Product } from 'src/products/entities/product.entity';
import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';


@Entity()
export class CartItem {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('integer', { name: 'productId' })
    productId: number;

    @Column('integer', { name: 'cartId' })
    cartId: number;

    @Column({ type: 'float', default: 0 })
    quantity: number;

    @Column({ type: 'float', default: 0 })
    price: number;

    @Column({ type: 'float', default: 0 })
    subTotalPrice: number;

    @Column({ type: 'float', default: 0 })
    discountRate: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAte: Date;

    @ManyToOne(() => Cart, (cart) => cart.cartItems, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn([{ name: 'cartId', referencedColumnName: 'id' }])
    cart: Cart;

    @ManyToOne(() => Product, (product) => product.cartItems, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn([{ name: 'productId', referencedColumnName: 'id' }])
    product: Product;
}