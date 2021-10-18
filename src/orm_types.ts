// General imports
import { InputType, Field, ObjectType, Int } from "type-graphql";
// Entity imports
import { Beat } from "./entities/Beat";
import { User } from "./entities/User";
// Type imports
import { MusicalKeys } from "./types";

@InputType()
export class RegisterUserInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;

    @Field(() => String)
    email: string;
}

@InputType()
export class CreateBeatInput {
    @Field(() => String)
    title!: string;

    @Field(() => String)
    genre!: string;

    @Field(() => Int)
    bpm!: number;

    @Field(() => String)
    key!: MusicalKeys;

    @Field(() => [String])
    tags!: string[];

    @Field(() => String)
    s3Key!: string;
}

@InputType()
export class UpdateBeatInput {
    @Field(() => Int)
    id!: number;

    @Field(() => String)
    title!: string;

    @Field(() => String)
    genre!: string;

    @Field(() => Int)
    bpm!: number;

    @Field(() => String)
    key!: MusicalKeys;

    @Field(() => [String])
    tags!: string[];
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
export class CreateBeatResponse {
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
export class UserPaginatedBeatsResponse {
    @Field(() => Int)
    id: number;

    @Field(() => String)
    username: string;

    @Field(() => String)
    email: string;

    @Field(() => String)
    createdAt: Date;

    @Field(() => String)
    updatedAt: Date;

    @Field(() => PaginatedBeatsResponse)
    beats: PaginatedBeatsResponse;
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
