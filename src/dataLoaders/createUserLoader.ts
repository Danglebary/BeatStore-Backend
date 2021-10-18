// General imports
import DataLoader from "dataloader";
// Entity imports
import { User } from "../entities/User";

export const createUserLoader = () =>
    new DataLoader<number, User>(async (userIds) => {
        const users = await User.findByIds(userIds as number[]);
        const userIdToUser: Record<number, User> = {};
        users.forEach((u) => {
            userIdToUser[u.id] = u;
        });

        return userIds.map((userId) => userIdToUser[userId]);
    });
