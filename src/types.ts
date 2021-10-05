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

export enum MusicalKeys {
    C_MAJOR = "c_major",
    C_MINOR = "c_minor",
    C_SHARP_MAJOR = "c_sharp_major",
    C_SHARP_MINOR = "c_sharp_minor",
    D_MAJOR = "d_major",
    D_MINOR = "d_minor",
    D_SHARP_MAJOR = "d_sharp_major",
    D_SHARP_MINOR = "d_sharp_minor",
    E_MAJOR = "e_major",
    E_MINOR = "e_minor",
    F_MAJOR = "f_major",
    F_MINOR = "f_minor",
    F_SHARP_MAJOR = "f_sharp_major",
    F_SHARP_MINOR = "f_sharp_minor",
    G_MAJOR = "g_major",
    G_MINOR = "g_minor",
    G_SHARP_MAJOR = "g_sharp_major",
    G_SHARP_MINOR = "g_sharp_minor",
    A_MAJOR = "a_major",
    A_MINOR = "a_minor",
    A_SHARP_MAJOR = "a_sharp_major",
    A_SHARP_MINOR = "a_sharp_minor",
    B_MAJOR = "b_major",
    B_MINOR = "b_minor"
}
