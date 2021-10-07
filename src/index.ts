// General imports
import express from "express";
// TypeORM imports
import { createConnection } from "typeorm";
import ormConfig from "./type-orm.config";
// Middleware imports
import { corsMiddleware } from "./middleware/server/corsMiddleware";
import { sessionMiddleware } from "./middleware/server/sessionMiddleware";
// Custom imports
import { PORT, __prod__ } from "./constants";
import { graphqlConfig } from "./middleware/server/graphqlConfig";

const main = async () => {
    // create postgres db connection
    await createConnection(ormConfig);

    // create server instance
    const app = express();

    // apply server cors configuration
    app.use(corsMiddleware());

    // instantiate and connect to redis store
    const { redis, sessionMiddleware: session } = sessionMiddleware();

    // apply session configuration with redis store
    app.use(session);

    // apply and connect server graphQL route
    const graphql = await graphqlConfig(redis);
    app.use("/graphql", graphql);

    // start server
    app.listen(PORT, () => {
        console.log(`[SERVER] running on port ${PORT}`);
    });
};

main();
