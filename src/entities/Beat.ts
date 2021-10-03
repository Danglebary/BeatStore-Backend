// General imports
import { Field, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
// Custom imports
import { MusicalKeys } from "../types";
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

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    genre: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: "int", nullable: true })
    bpm: number;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    key: MusicalKeys;

    @Field(() => String, { nullable: true })
    @Column({ type: "simple-array", nullable: true })
    tags: string[];

    @Field()
    @Column({ type: "int", default: 0 })
    likes!: number;

    @Field(() => Int)
    @Column()
    creatorId!: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.beats)
    creator!: User;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    url: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
