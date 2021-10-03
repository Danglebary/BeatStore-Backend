// General imports
import {
    Arg,
    Ctx,
    Int,
    Mutation,
    Query,
    Resolver,
    UseMiddleware
} from "type-graphql";
import { getConnection } from "typeorm";
import { Beat } from "../entities/Beat";
import { isAuth } from "../middleware/isAuth";
// Custom imports
import {
    BeatResponse,
    PaginatedBeats,
    CreateBeatInput,
    UpdateBeatInput
} from "../orm_types";
import { MyContext } from "../types";
import { validateBeatUpload } from "../validation/validate_beat";

@Resolver(Beat)
export class BeatResolver {
    // default is sorted by newest first
    @Query(() => PaginatedBeats)
    async beats(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedBeats> {
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

    @Mutation(() => Beat)
    @UseMiddleware(isAuth)
    async createBeat(
        @Arg("options") options: CreateBeatInput,
        @Ctx() { req }: MyContext
    ): Promise<BeatResponse> {
        const validation = validateBeatUpload(options);

        if (validation.errors) {
            return validation;
        }

        const beat = await Beat.create({
            ...options,
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

    @Mutation(() => Boolean)
    async deleteBeat(@Arg("id", () => Int) id: number): Promise<boolean> {
        await Beat.delete(id);
        return true;
    }
}
