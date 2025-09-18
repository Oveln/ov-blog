-- DropForeignKey
ALTER TABLE "public"."Post_Version" DROP CONSTRAINT "Post_Version_postId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Post_Version" ADD CONSTRAINT "Post_Version_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
