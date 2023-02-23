import { Exclude } from "class-transformer";
import { Role } from "src/auth/roles/roles.enum";
import { Cart } from "src/carts/entities/cart.entity";
import { Order } from "src/orders/entities/order.entity";
import { Transaction } from "src/orders/entities/transaction.entity";
import { Product } from "src/products/entities/product.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', unique: true })
    email: string

    @Column({ type: 'varchar' })
    name: string

    @Column({ type: 'varchar' })
    @Exclude()
    password: string

    @Column({ type: 'varchar', nullable: true, default: null })
    @Exclude()
    refreshToken: string

    @Column({ type: 'enum', array: true, enum: Role, default: [Role.USER] })
    roles: Role[]

    @OneToMany(() => Cart, cart => cart.user, { eager: true })
    carts: Cart[]

    @OneToMany(() => Order, order => order.user)
    orders: Order[]

    @OneToMany(() => Product, product => product.user)
    //TODO: Probably we don't need this field/relationship
    products: Product[]

    @OneToMany(() => Transaction, (transaction) => transaction.user, { eager: true })
    //TODO: Remove Eager true in the future, to avoid load the entity
    transactions: Transaction[];

    @Exclude()
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAte: Date;
}
