import { Request, Response } from "express";
import session from "express-session";
import { Redis } from "ioredis";

declare module "express-session" {
    export interface SessionData {
        userId: any;
    }
}

export type MyContext = {
    req: Request & { session: typeof session };
    res: Response;
    redis: Redis;
};
