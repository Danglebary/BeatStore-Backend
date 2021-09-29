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
import { CreateBeatInput, UpdateBeatInput } from "../orm_types";
import { MyContext } from "../types";

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
    createPost(
        @Arg("options") options: CreateBeatInput,
        @Ctx() { req }: MyContext
    ): Promise<Beat> {
        return Beat.create({
            ...options,
            creatorId: req.session.userId
        }).save();
    }

    @Mutation(() => Beat, { nullable: true })
    async updatePost(
        @Arg("options") options: UpdateBeatInput
    ): Promise<Beat | null> {
        const beat = await Beat.findOne({ where: { id: options.id } });
        if (!beat) return null;

        return beat;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg("id", () => Int) id: number): Promise<boolean> {
        await Beat.delete(id);
        return true;
    }
}
