import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToMany
} from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { Beat } from "./Beat";
import { Like } from "./Like";
import { PaginatedBeatsResponse } from "../orm_types";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Field(() => String)
    @Column({ unique: true })
    email!: string;

    @Field(() => PaginatedBeatsResponse)
    @OneToMany(() => Beat, (beat) => beat.creator)
    beats!: PaginatedBeatsResponse;

    @Field(() => [Like])
    @OneToMany(() => Like, (like) => like.user)
    likes: Like[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
