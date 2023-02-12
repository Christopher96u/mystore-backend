import { Exclude } from 'class-transformer';
import { Product } from 'src/products/entities/product.entity';
import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';


@Entity()
export class CartItem {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cart, cart => cart.cartItems)
    cart: Cart;

    @ManyToOne(() => Product, product => product.cartItems, {
        cascade: true,

        nullable: false,
    })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Product;

    @Column({ type: 'float', default: 0 })
    quantity: number;

    @Column({ type: 'float', default: 0 })
    price: number;

    @Column({ type: 'float', default: 0 })
    subTotalPrice: number;

    @Column({ type: 'float', default: 0 })
    discountRate: number;

    @Exclude()
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAte: Date;
}