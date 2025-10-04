import { publicProcedure, router } from "../trpc";
import { Version } from "@/lib/version";

export const versionRouter = router({
    info: publicProcedure.query(() => {
        const version = Version.getInstance();
        return version.toJSON();
    }),
});
