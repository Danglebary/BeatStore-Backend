import { InputType, Field, ObjectType } from 'type-graphql';
import { User } from './entities/User';

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
