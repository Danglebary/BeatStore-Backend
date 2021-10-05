// General imports
import {
    Arg,
    Ctx,
    FieldResolver,
    Int,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware
} from "type-graphql";
import { getConnection } from "typeorm";
import { Beat } from "../entities/Beat";
import { Like } from "../entities/Like";
import { isAuth } from "../middleware/isAuth";
// Custom imports
import {
    PaginatedBeatsResponse,
    CreateBeatInput,
    UpdateBeatInput,
    ErrorsOrValidResponse,
    CreateBeatResponse
} from "../orm_types";
import { MyContext } from "../types";
import { validateBeatUpload } from "../validation/validate_beat";

@Resolver(Beat)
export class BeatResolver {
    @FieldResolver(() => [String])
    tags(@Root() beat: Beat) {
        return beat.tags.split(",");
    }

    // default is sorted by newest first
    @Query(() => PaginatedBeatsResponse)
    async beats(
        @Arg("limit", () => Int, { nullable: true, defaultValue: 10 })
        limit: number,
        @Ctx() { req }: MyContext,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedBeatsResponse> {
        const maxLimit = Math.min(50, limit);
        const checkForMoreLimit = maxLimit + 1;

        const replacements: any[] = [checkForMoreLimit];

        const userId = req.session.userId;

        console.log(userId);

        if (userId) {
            replacements.push(userId);
        }

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const beats = await getConnection().query(
            `
        select b.*,
        json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'location', u.location,
            'isAdmin', u."isAdmin",
            'createdAt', u."createdAt",
            'updatedAt', u."updatedAt"
        ) creator,
        ${
            userId
                ? '(select exists (select "userId" from "like" where "userId" = $2 and "beatId" = b.id)) "likeStatus"'
                : 'false as "likeStatus"'
        }
        from Beat b
        inner join public.user u on u.id = b."creatorId"
        ${cursor && !userId ? `where b."createdAt" > $2` : ""}
        ${cursor && userId ? `where b."createdAt" > $3 ` : ""}
        order by b."createdAt" DESC
        limit $1
        `,
            replacements
        );

        return {
            beats: beats.slice(0, maxLimit),
            hasMore: beats.length === checkForMoreLimit
        };
    }

    @Query(() => Beat, { nullable: true })
    async beat(
        @Arg("id", () => Int) beatId: number,
        @Ctx() { req }: MyContext
    ): Promise<Beat | undefined> {
        const userId = req.session.userId;
        const result = await getConnection().query(
            `
            select b.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email,
                'location', u.location,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt"
            ) creator,
            ${
                userId
                    ? '(select exists (select "userId" from "like" where "userId" = $2 and "beatId" = b.id)) "likeStatus"'
                    : 'false as "likeStatus"'
            }
            from Beat b
            inner join public.user u on u.id = b."creatorId"
            where b.id = $1
            limit 1
            `,
            [beatId, userId]
        );

        return result[0];
    }

    @Mutation(() => CreateBeatResponse)
    @UseMiddleware(isAuth)
    async createBeat(
        @Arg("options") options: CreateBeatInput,
        @Ctx() { req }: MyContext
    ): Promise<CreateBeatResponse> {
        const validation = validateBeatUpload(options);

        if (validation.errors) {
            return validation;
        }

        const stringTags = JSON.stringify(options.tags);

        const beat = await Beat.create({
            ...options,
            tags: stringTags,
            creatorId: req.session.userId
        }).save();

        return { beat };
    }

    @Mutation(() => CreateBeatResponse)
    @UseMiddleware(isAuth)
    async updateBeat(
        @Arg("options") options: UpdateBeatInput
    ): Promise<CreateBeatResponse> {
        const beat = await Beat.findOne({ where: { id: options.id } });
        if (!beat)
            return {
                errors: [{ field: "id", message: "beat no longer exists" }]
            };

        return { beat };
    }

    @Mutation(() => ErrorsOrValidResponse)
    @UseMiddleware(isAuth)
    async likeBeat(
        @Arg("beatId", () => Int) beatId: number,
        @Ctx() { req }: MyContext
    ): Promise<ErrorsOrValidResponse> {
        const { userId } = req.session;

        const beat = await Beat.findOne({ id: beatId });
        const like = await Like.findOne({ where: { beatId, userId } });

        if (!beat) {
            return {
                error: {
                    field: "like",
                    message: "beat does not exist"
                }
            };
        }

        if (userId === beat.creatorId) {
            return {
                error: {
                    field: "like",
                    message: "cannot like your own beat"
                }
            };
        }

        if (like) {
            await getConnection().query(`
            START TRANSACTION;
            delete from "like" where "userId" = ${userId} and "beatId" = ${beatId};
            update beat
            set "likesCount" = "likesCount" - 1
            where id = ${beatId};
            COMMIT;
            `);
            return { valid: true };
        }

        await getConnection().query(`
        START TRANSACTION;
        insert into "like" ("userId", "beatId")
        values (${userId}, ${beatId});
        update beat
        set "likesCount" = "likesCount" + 1
        where id = ${beatId};
        COMMIT;
        `);

        return { valid: true };
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deleteBeat(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        const beat = await Beat.findOne(id);
        if (!beat) {
            return false;
        }
        if (beat.creatorId !== req.session.userId) {
            throw new Error("not authorized");
        }
        await Like.delete({ beatId: id });
        await Beat.delete(id);
        return true;
    }
}
