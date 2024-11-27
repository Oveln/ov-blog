"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { UserPostRetType } from "@/app/(auth)/api/user/route";
import { SearchAndFilter } from "./SearchAndFilter";
import { PostList } from "./PostList";
import { PostContent } from "./PostContent";
import 'cherry-markdown/dist/cherry-markdown.css';

export default function PostEdit() {
    const [data, setData] = useState<UserPostRetType[]>([]);
    const [selectedPost, setSelectedPost] = useState<UserPostRetType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const loadingTimerRef = useRef<NodeJS.Timeout>();

    const session = useSession({
        required: true
    });

    useEffect(() => {
        if (session.status !== "authenticated") return;
        const getData = async () => {
            const data = await fetch(`/api/user/${session.data.user?.name}`);
            setData(await data.json());
        };
        getData();
    }, [session.status]);

    const handleChange = (postId: number, version: number, action: "delete" | "check_out") => {
        // 创建data的拷贝
        const newData = [...data];
        switch (action) {
            case "delete":
                for (let i = 0; i < newData.length; i++) {
                    if (newData[i].id === postId) {
                        newData[i].postVersions = newData[i].postVersions.filter(
                            (v) => v.version !== version
                        );
                        if (newData[i].postVersions.length === 0) {
                            newData.splice(i, 1);
                            i--;
                        } else if (newData[i].current_version == version) {
                            // 找到最大的版本，设置为发布
                            const maxVersion = Math.max(
                                ...newData[i].postVersions.map((v) => v.version)
                            );
                            newData[i].current_version = maxVersion;
                        }
                        break;
                    }
                }
                break;
            case "check_out":
                for (let i = 0; i < newData.length; i++) {
                    if (newData[i].id === postId) {
                        newData[i].current_version = version;
                        break;
                    }
                }
        }
        setData(newData as UserPostRetType[]);
    };

    const handlePostSelect = async (post: UserPostRetType) => {
        if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
        }

        setSelectedPost(post);

        const loadingTimer = setTimeout(() => {
            setIsLoading(true);
        }, 150);
        loadingTimerRef.current = loadingTimer;

        try {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getAllTags = () => {
        const tagSet = new Set<string>();
        data.forEach(post => {
            post.currentVersion?.tags?.forEach((tag: { tagName: string }) => tagSet.add(tag.tagName));
        });
        return Array.from(tagSet);
    };

    const filteredPosts = data.filter(post => {
        const matchesSearch = post.currentVersion?.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = !selectedTag || post.currentVersion?.tags?.some(tag => tag.tagName === selectedTag);
        return matchesSearch && matchesTag;
    });

    return (
        <div className="h-full flex">
            <div className="w-[400px] border-r h-full flex flex-col">
                <SearchAndFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    tags={getAllTags()}
                />
                <PostList
                    posts={filteredPosts}
                    selectedPost={selectedPost}
                    onPostSelect={handlePostSelect}
                />
            </div>
            <div className="flex-1 h-full overflow-auto px-8 shadow-md">
                <PostContent
                    post={selectedPost}
                    isLoading={isLoading}
                    handleChange={handleChange}
                />
            </div>
        </div>
    );
}

PostEdit.auth = true;
