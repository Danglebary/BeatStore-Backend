// TypeORM imports
import { ConnectionOptions } from "typeorm";
// Entity imports
import { User } from "./entities/User";
import { Post } from "./entities/Post";

const ormConfig: ConnectionOptions = {
    type: "postgres",
    database: "beat-store-v1",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [User, Post]
};

export default ormConfig;
