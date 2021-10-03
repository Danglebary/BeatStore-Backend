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
import { isAuth } from "../middleware/isAuth";
// Custom imports
import {
    BeatResponse,
    PaginatedBeatsResponse,
    CreateBeatInput,
    UpdateBeatInput,
    ErrorsOrValidResponse
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
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedBeatsResponse> {
        const maxLimit = Math.min(50, limit);
        const checkForMoreLimit = maxLimit + 1;

        const replacements: any[] = [checkForMoreLimit];

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const beats = await getConnection().query(
            `
        
        select b.*,
        json_build_object(
            'id', u.id,
            'userName', u."userName",
            'email', u.email,
            'location', u.location,
            'isAdmin', u."isAdmin",
            'createdAt', u."createdAt",
            'updatedAt', u."updatedAt"
        ) creator
        from Beat b
        inner join public.user u on u.id = b."creatorId"
        ${cursor ? `where b."createdAt" > $2 ` : ""}
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
    beat(@Arg("id", () => Int) id: number): Promise<Beat | undefined> {
        return Beat.findOne(id);
    }

    @Mutation(() => BeatResponse)
    @UseMiddleware(isAuth)
    async createBeat(
        @Arg("options") options: CreateBeatInput,
        @Ctx() { req }: MyContext
    ): Promise<BeatResponse> {
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

    @Mutation(() => Beat, { nullable: true })
    async updateBeat(
        @Arg("options") options: UpdateBeatInput
    ): Promise<BeatResponse> {
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

        await getConnection().query(
            `
        START TRANSACTION;
        insert into likes ("userId", "beatId")
        values (${userId}, ${beatId});
        update beat
        set "likesCount" = "likesCount" + 1
        where id = ${beatId};
        COMMIT;
        `
        );

        return { valid: true };
    }

    @Mutation(() => Boolean)
    async deleteBeat(@Arg("id", () => Int) id: number): Promise<boolean> {
        await Beat.delete(id);
        return true;
    }
}
