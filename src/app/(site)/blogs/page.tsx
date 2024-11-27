import React from "react";
import clsx from "clsx";
import PostList from "./PostList";
import { getAllPostCardInfo } from "@/lib/db";

export const revalidate = 10;

const Blogs = async () => {
    const posts = await getAllPostCardInfo();

    return (
        <div className={clsx("mx-auto max-w-3xl py-8 min-h-[calc(100vh-56px)] px-4")}>
            <PostList posts={posts} />
        </div>
    );
};

export default Blogs;
