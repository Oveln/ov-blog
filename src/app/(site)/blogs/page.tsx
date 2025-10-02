import React from "react";
import clsx from "clsx";
import PostList from "./PostList";
import { createServerCaller } from "@/server/trpc/server-caller";

export const revalidate = 30;

const Blogs = async () => {
    // 使用 tRPC 服务器端调用获取数据
    const trpc = await createServerCaller();
    const posts = await trpc.posts.getAllPostCardInfo();

    return (
        <div className={clsx("mx-auto max-w-3xl py-8 min-h-[calc(100vh-56px)] px-4")}>
            <PostList posts={posts} />
        </div>
    );
};

export default Blogs;
