// General imports
import { Field, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
// Custom imports
import { MusicalKeys } from "../types";
import { Like } from "./Like";
import { User } from "./User";

@ObjectType()
@Entity()
export class Beat extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column()
    title!: string;

    @Field(() => String)
    @Column()
    genre!: string;

    @Field(() => Int)
    @Column({ type: "int" })
    bpm!: number;

    @Field(() => String)
    @Column()
    key!: MusicalKeys;

    @Field(() => [String])
    @Column()
    tags!: string;

    @Field(() => Int)
    @Column()
    creatorId!: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.beats)
    creator!: User;

    @Field(() => String)
    @Column()
    s3Key!: string;

    @Field(() => Int)
    @Column({ type: "int", default: 0 })
    likesCount!: number;

    @Field(() => Boolean)
    likeStatus!: boolean;

    @OneToMany(() => Like, (like) => like.beat)
    likes: Like[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
