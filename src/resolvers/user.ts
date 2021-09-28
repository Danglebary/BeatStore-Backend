// General imports
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import { v4 } from "uuid";
// Custom imports
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import {
    validateChangePassword,
    validateRegister
} from "../validation/validate_user";
import { sendEmail } from "../utils/sendEmailDev";
import { MyContext } from "../types";
import { UserResponse, RegisterUserInput, LoginUserInput } from "../orm_types";

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
        if (!req.session.userId) return null;
        return await em.findOne(User, { id: req.session.userId });
    }

    @Query(() => [User])
    async users(@Ctx() { em }: MyContext): Promise<User[]> {
        return await em.find(User, {});
    }

    @Query(() => User, { nullable: true })
    async user(
        @Arg("id", () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<User | null> {
        return await em.findOne(User, { id });
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: RegisterUserInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const validation = await validateRegister(options, em);
        if (validation.errors) {
            return validation;
        }

        // never store plain-text passwords!
        const hashedPass = await argon2.hash(options.password);
        const user = em.create(User, {
            email: options.email,
            userName: options.username,
            password: hashedPass
        });

        await em.persistAndFlush(user);

        // set client session to log user in
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    async removeUser(
        @Arg("userId") userId: number,
        @Ctx() { em, req }: MyContext
    ): Promise<Boolean> {
        // check if logged in && isAdmin first
        const reqUser = await em.findOne(User, { id: req.session.userId });
        if (!reqUser) return false;
        if (!reqUser.isAdmin) return false;

        // check if user to be removed exists
        const userById = await em.findOne(User, { id: userId });
        if (!userById) return false;

        try {
            await em.nativeDelete(User, { id: userId });
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: LoginUserInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const isEmail = options.usernameOrEmail.includes("@");

        const user = await em.findOne(
            User,
            isEmail
                ? { email: options.usernameOrEmail }
                : { userName: options.usernameOrEmail }
        );

        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: isEmail
                            ? "email does not exist"
                            : "username does not exist"
                    }
                ]
            };
        }

        const isValidPass = await argon2.verify(
            user.password,
            options.password
        );

        if (!isValidPass) {
            return {
                errors: [{ field: "password", message: "incorrect password" }]
            };
        }

        // set client session to log user in
        req.session!.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                // clear cookie even if session fails to be destroyed
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        );
    }

    @Mutation(() => Boolean)
    async forgotPasswordDev(
        @Arg("email") email: string,
        @Ctx() { em, redis }: MyContext
    ): Promise<Boolean> {
        const user = await em.findOne(User, { email });
        // if email is not associated with a user, return true
        // to prevent phishing atempts
        if (!user) return true;

        const token = v4();

        const expirationLength = 1000 * 60 * 60 * 24 * 3; // 3 days

        await redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            "ex",
            expirationLength
        );

        const html = `<a href="http://localhost:3000/change-password/${token}">reset password</a>`;

        await sendEmail(email, "Change Password", html);
        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { em, req, redis }: MyContext
    ): Promise<UserResponse> {
        const validation = validateChangePassword(newPassword);
        if (validation.errors) {
            return validation;
        }

        const redisKey = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(redisKey);
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired"
                    }
                ]
            };
        }

        const user = await em.findOne(User, { id: parseInt(userId) });
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists"
                    }
                ]
            };
        }

        const hashedPass = await argon2.hash(newPassword);
        user.password = hashedPass;
        try {
            await em.persistAndFlush(user);
            await redis.del(redisKey);
            // set client session to log user in
            req.session!.userId = user.id;
            return { user };
        } catch (err) {
            return { errors: [{ field: "server", message: "error" }] };
        }
    }
}
