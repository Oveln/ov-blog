import { getPostById } from "@/data/db";
import { notFound } from "next/navigation";
import React, { useEffect, useState } from "react";
import Markdown from 'react-markdown'

const Post = async ({params}:{params: {slug: string}}) => {
    const post = await getPostById(parseInt(params.slug));
    // const post = {
    //     content: `# hello \n ## world \n ### im `
    // }
    if (!post) {
        return notFound();
    }
    return <Markdown>
        {post.content}
    </Markdown>
};

export default Post;
