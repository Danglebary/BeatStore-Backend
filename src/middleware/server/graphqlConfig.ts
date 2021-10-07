// General imports
import { graphqlHTTP } from "express-graphql";
// GraphQL imports
import "reflect-metadata";
import { buildSchema } from "type-graphql";
// Resolver imports
import { UserResolver } from "../../resolvers/user";
import { BeatResolver } from "../../resolvers/beat";
// Type imports
import IORedis from "ioredis";
import { MyContext } from "../../types";

export const graphqlConfig = async (redis: IORedis.Redis) => {
    return graphqlHTTP(async (req, res) => {
        return {
            schema: await buildSchema({
                resolvers: [UserResolver, BeatResolver],
                validate: false
            }),
            context: { req, res, redis } as MyContext,
            graphiql: true
        };
    });
};
