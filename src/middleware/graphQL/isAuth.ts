// GraphQL imports
import { MiddlewareFn } from "type-graphql";
// Custom imports
import { MyContext } from "../../types";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new Error("not authenticated");
    }

    return next();
};
