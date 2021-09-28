// General imports
import express from "express";
import { graphqlHTTP } from "express-graphql";
import cors from "cors";
// type-graphQL imports
import "reflect-metadata";
import { buildSchema } from "type-graphql";
// MikroORM imports
import { MikroORM } from "@mikro-orm/core";
import ormConfig from "./mikro-orm.config";
// Redis imports
import Redis from "ioredis";
import connectRedis from "connect-redis";
import session from "express-session";

// Custom imports
import { COOKIE_NAME, PORT, __prod__ } from "./constants";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";

const main = async () => {
    console.log("[SERVER] initializing database connection");
    const orm = await MikroORM.init(ormConfig);
    await orm.getMigrator().up();

    console.log("[SERVER] creating server instance");
    const app = express();

    console.log("[SERVER] applying cors configuration");
    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true,
            optionsSuccessStatus: 200
        })
    );

    console.log("[SERVER] applying Redis middleware");
    const RedisStore = connectRedis(session);
    const redis = new Redis();
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
                sameSite: "lax",
                secure: __prod__
            },
            saveUninitialized: false,
            secret: "ha ha ha ha ha, you mad, or nah?",
            resave: false
        })
    );

    console.log("[SERVER] applying express-graphql middleware");
    app.use(
        "/graphql",
        graphqlHTTP(async (req, res) => {
            return {
                schema: await buildSchema({
                    resolvers: [PostResolver, UserResolver],
                    validate: false
                }),
                context: { em: orm.em, req, res, redis } as MyContext,
                graphiql: true
            };
        })
    );

    console.log("[SERVER] middleware applied");

    app.listen(PORT, () => {
        console.log(`[SERVER] running on port ${PORT}`);
    });
};

main();
