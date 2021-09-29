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

export type MusicalKeys =
    | "c_major"
    | "c_minor"
    | "c_sharp_major"
    | "c_sharp_minor"
    | "d_major"
    | "d_minor"
    | "d_sharp_major"
    | "d_sharp_minor"
    | "e_major"
    | "e_minor"
    | "f_major"
    | "f_minor"
    | "f_sharp_major"
    | "f_sharp_minor"
    | "g_major"
    | "g_minor"
    | "g_sharp_major"
    | "g_sharp_minor"
    | "a_major"
    | "a_minor"
    | "a_sharp_major"
    | "a_sharp_minor"
    | "b_major"
    | "b_minor";
