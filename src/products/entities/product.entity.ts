import { Category } from '../../categories/entities/category.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { CartItem } from 'src/carts/entities/cart-item.entity';
import { User } from 'src/users/entities/user.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'integer', name: 'userId' })
    userId: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'float' })
    price: number;

    @Column({ type: 'float', nullable: true, default: 0 })
    discountRate: number;

    @Column({ type: 'int' })
    stock: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    imageUrl: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => Category, (category) => category.products)
    category: Category;

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];

    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems: OrderItem[];

    @ManyToOne(() => User, (user) => user.products, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
    user: User;

}