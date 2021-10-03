// General imports
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from "typeorm";
// Custom imports
import { Beat } from "./Beat";
import { User } from "./User";

@ObjectType()
@Entity()
export class Like extends BaseEntity {
    @Field(() => Int)
    @PrimaryColumn()
    userId!: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.likes)
    user!: User;

    @Field(() => Int)
    @PrimaryColumn()
    beatId!: number;

    @Field(() => Beat)
    @ManyToOne(() => Beat, (beat) => beat.likes)
    beat!: Beat;
}
