// General imports
import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";

export const sessionMiddleware = () => {
    const RedisStore = connectRedis(session);
    const redis = new Redis();

    const sessionMiddleware = session({
        name: process.env.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true
        }),
        cookie: {
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        },
        saveUninitialized: false,
        secret: "ha ha ha ha ha, you mad, or nah?",
        resave: false
    });

    return { redis, sessionMiddleware };
};
