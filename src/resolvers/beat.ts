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
import { Beat } from "../entities/Beat";
import { isAuth } from "../middleware/isAuth";
// Custom imports
import { BeatResponse, CreateBeatInput, UpdateBeatInput } from "../orm_types";
import { MyContext } from "../types";
import { validateBeatUpload } from "../validation/validate_beat";

@Resolver()
export class BeatResolver {
    @Query(() => [Beat])
    beats(): Promise<Beat[]> {
        return Beat.find();
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
