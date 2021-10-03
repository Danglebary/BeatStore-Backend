// General imports
import path from "path";
// TypeORM imports
import { ConnectionOptions } from "typeorm";
// Entity imports
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { Beat } from "./entities/Beat";
import { Like } from "./entities/Like";

const ormConfig: ConnectionOptions = {
    type: "postgres",
    database: "beat-store-v1",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post, Beat, Like]
};

export default ormConfig;
