import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: "text", unique: true })
    userName!: string;

    @Property({ type: "text" })
    password!: string;

    @Field(() => String)
    @Property({ type: "text", unique: true })
    email!: string;

    @Field(() => String)
    @Property({ type: "text", nullable: true })
    location: string;

    @Field(() => Boolean)
    @Property({ type: "boolean", nullable: true })
    isAdmin: Boolean;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();
}
