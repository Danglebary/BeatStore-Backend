import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
} from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column({ unique: true })
    userName!: string;

    @Column()
    password!: string;

    @Field(() => String)
    @Column({ unique: true })
    email!: string;

    @Field(() => String)
    @Column({ nullable: true })
    location: string;

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
    isAdmin: Boolean;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
