// General imports
import DataLoader from "dataloader";
// Entity imports
import { Like } from "../entities/Like";

export const createLikeLoader = () =>
    new DataLoader<{ beatId: number; userId: number }, Like | null>(
        async (keys) => {
            const likes = await Like.findByIds(keys as any);
            const likeIdsToLike: Record<string, Like> = {};
            likes.forEach((like) => {
                likeIdsToLike[`${like.beatId}|${like.userId}`] = like;
            });
            return keys.map(
                (key) => likeIdsToLike[`${key.beatId}|${key.userId}`]
            );
        }
    );
