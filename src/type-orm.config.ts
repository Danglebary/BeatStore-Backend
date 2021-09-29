// TypeORM imports
import { ConnectionOptions } from "typeorm";
// Entity imports
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { Beat } from "./entities/Beat";

const ormConfig: ConnectionOptions = {
    type: "postgres",
    database: "beat-store-v1",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [User, Post, Beat]
};

export default ormConfig;
