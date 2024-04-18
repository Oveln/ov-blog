import React from "react";
import clsx from "clsx";
import PostList from "./PostList";

const Blogs = () => {
    return (
        <div
            className={clsx(
                "mx-auto max-w-3xl py-8 min-h-[calc(100vh-56px)]"
            )}
        >
            <PostList />
        </div>
    );
};

export default Blogs;
