// General imports
import cors from "cors";

export const corsMiddleware = () => {
    return cors({
        origin: "http://localhost:3000",
        credentials: true,
        optionsSuccessStatus: 200
    });
};
