import { InputType, Field, ObjectType, Int } from "type-graphql";
import { Beat } from "./entities/Beat";
import { User } from "./entities/User";
import { MusicalKeys } from "./types";

@InputType()
export class RegisterUserInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;

    @Field(() => String)
    email: string;

    @Field(() => String, { nullable: true })
    location?: string;
}

@InputType()
export class CreateBeatInput {
    @Field(() => String)
    title!: string;

    @Field(() => String, { nullable: true })
    genre?: string;

    @Field(() => Int, { nullable: true })
    bpm?: number;

    @Field(() => String, { nullable: true })
    key?: MusicalKeys;

    @Field(() => [String], { nullable: true })
    tags?: string[];
}

@InputType()
export class UpdateBeatInput {
    @Field(() => Int)
    id!: number;

    @Field(() => String, { nullable: true })
    title?: string;

    @Field(() => String, { nullable: true })
    genre?: string;

    @Field(() => Int, { nullable: true })
    bpm?: number;

    @Field(() => String, { nullable: true })
    key?: MusicalKeys;

    @Field(() => [String], { nullable: true })
    tags?: string[];
}

@InputType()
export class LoginUserInput {
    @Field(() => String)
    usernameOrEmail: string;

    @Field(() => String)
    password: string;
}

@ObjectType()
export class FieldError {
    @Field(() => String)
    field: string;
    @Field(() => String)
    message: string;
}

@ObjectType()
export class BeatResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => Beat, { nullable: true })
    beat?: Beat;
}

@ObjectType()
export class PaginatedBeatsResponse {
    @Field(() => [Beat])
    beats: Beat[];

    @Field()
    hasMore: boolean;
}

@ObjectType()
export class ErrorsOrValidResponse {
    @Field(() => FieldError, { nullable: true })
    error?: FieldError;

    @Field(() => Boolean, { nullable: true })
    valid?: boolean;
}

@ObjectType()
export class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@ObjectType()
export class ValidationResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => Boolean, { nullable: true })
    valid?: Boolean;
}
