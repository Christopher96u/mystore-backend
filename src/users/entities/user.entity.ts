import { Exclude } from "class-transformer";
import { Role } from "src/auth/roles/roles.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
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
    refreshToken: string

    @Column({ type: 'enum', array: true, enum: Role, default: [Role.USER] })
    roles: Role[]

    @Exclude()
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAte: Date;
}
