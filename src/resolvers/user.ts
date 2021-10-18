// General imports
import {
    Arg,
    Ctx,
    FieldResolver,
    Int,
    Mutation,
    Query,
    Resolver,
    Root
} from "type-graphql";
import argon2 from "argon2";
import { v4 } from "uuid";
// Custom imports
import { User } from "../entities/User";
import {
    validateChangePassword,
    validateRegister
} from "../validation/validate_user";
import { sendEmail } from "../utils/sendEmailDev";
// Type imports
import { MyContext } from "../types";
import {
    UserResponse,
    RegisterUserInput,
    LoginUserInput,
    PaginatedBeatsResponse
} from "../orm_types";
import { getConnection } from "typeorm";

const FORGET_PASSWORD_PREFIX = process.env.FORGOT_PASSWORD_PREFIX;

@Resolver(User)
export class UserResolver {
    // resolve email or empty string depending on the current logged in user
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        if (req.session.userId === user.id) {
            // current user and fetched user are the same person
            return user.email;
        }
        // current user fetching other user
        return "";
    }

    @FieldResolver(() => PaginatedBeatsResponse)
    async beats(
        @Root() user: User,
        @Arg("limit", () => Int, { nullable: true, defaultValue: 10 })
        limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string
    ) {
        const maxLimit = Math.min(50, limit);
        const checkForMoreLimit = maxLimit + 1;

        const replacements: any[] = [checkForMoreLimit, user.id];

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const beats = await getConnection().query(
            `
        select b.*
        from Beat b
        where b."creatorId" = $2
        ${cursor ? `and b."createdAt" < $3` : ""}
        order by b."createdAt" DESC
        limit $1
        `,
            replacements
        );

        return {
            beats: beats.slice(0, maxLimit),
            hasMore: beats.length === checkForMoreLimit
        };
    }

    // simple useful query to fetch current logged in user data
    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext): Promise<User | undefined> | undefined {
        if (!req.session.userId) return undefined;
        return User.findOne(req.session.userId);
    }

    // fetch all users
    @Query(() => [User])
    async users(): Promise<User[] | undefined> {
        return User.find({});
    }

    // fetch single user by id
    @Query(() => User, { nullable: true })
    async userById(
        @Arg("id", () => Int) id: number
    ): Promise<User | undefined> {
        return User.findOne(id);
    }

    // fetch single user by username
    @Query(() => User, { nullable: true })
    userByUsername(
        @Arg("username", () => String) username: string
    ): Promise<User | undefined> {
        return User.findOne({ username: username });
    }

    // register new user
    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: RegisterUserInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const validation = await validateRegister(options);
        if (validation.errors) {
            return validation;
        }
        const user = await User.create({
            email: options.email,
            username: options.username,
            password: await argon2.hash(options.password)
        }).save();

        // set client session to log user in
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: LoginUserInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const isEmail = options.usernameOrEmail.includes("@");
        const user = await User.findOne(
            isEmail
                ? { where: { email: options.usernameOrEmail } }
                : { where: { username: options.usernameOrEmail } }
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

        req.session!.userId = user.id;
        return { user };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                // clear cookie even if session fails to be destroyed
                res.clearCookie(process.env.COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        );
    }

    // send change password email to user if user exists with selected email,
    // dev version using nodemailer
    @Mutation(() => Boolean)
    async forgotPasswordDev(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext
    ): Promise<Boolean> {
        const user = await User.findOne({ where: { email } });
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

    // allow user to change password, only if they have successfully
    // retrieved uuid token from our email that was sent to them
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { req, redis }: MyContext
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

        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);
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

        await User.update(
            { id: userIdNum },
            { password: await argon2.hash(newPassword) }
        );
        await redis.del(redisKey);
        req.session!.userId = user.id;

        return { user };
    }
}
