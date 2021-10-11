// General imports
require("dotenv").config();
import express from "express";
import fileUpload from "express-fileupload";
// TypeORM imports
import { createConnection } from "typeorm";
import ormConfig from "./type-orm.config";
// Middleware imports
import { corsMiddleware } from "./middleware/server/corsMiddleware";
import { sessionMiddleware } from "./middleware/server/sessionMiddleware";
import { graphqlConfig } from "./middleware/server/graphqlConfig";
// Custom imports
import { uploadBeat } from "./restResolvers/uploadBeat";
import { fetchBeat } from "./restResolvers/fetchBeat";

const main = async () => {
    // process env vars
    const port = process.env.PORT;

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

    // beat file upload middleware, api, resolver
    app.use(fileUpload());
    app.post("/upload-beat", uploadBeat);
    app.get("/beat/:key", fetchBeat);

    // beat file fetch

    // start server
    app.listen(port, () => {
        console.log(`[SERVER] running on port ${port}`);
    });
};

main();
