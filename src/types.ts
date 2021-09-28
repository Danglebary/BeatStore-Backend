import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";
import session from "express-session";
import { Redis } from "ioredis";

declare module "express-session" {
    export interface SessionData {
        userId: any;
    }
}

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    req: Request & { session: typeof session };
    res: Response;
    redis: Redis;
};
