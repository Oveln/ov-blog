"use client";
import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { UserPostRetType } from "@/app/(auth)/api/user/route";
import { cn } from "@/lib/utils";
import { PostActionButtons } from "./PostActionButton";
import { Loader2 } from "lucide-react";
import 'cherry-markdown/dist/cherry-markdown.css';
import Cherry from "cherry-markdown";
import { Badge } from "@/components/ui/badge";


export default function PostEdit() {
    const [data, setData] = React.useState<UserPostRetType[]>([]);
    const [selectedPost, setSelectedPost] = useState<UserPostRetType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const loadingTimerRef = useRef<NodeJS.Timeout>();
    const cherryRef = useRef<Cherry | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

    useEffect(() => {
        const initCherry = async () => {
            const { default: CherryMarkdown } = await import('cherry-markdown');
            if (!selectedPost) return;
            // 如果已存在实例，先销毁
            if (cherryRef.current) {
                cherryRef.current.destroy();
                cherryRef.current = null;
            }

            // 创建新实例
            cherryRef.current = new CherryMarkdown({
                id: 'cherry-markdown',
                value: '',
                editor: {
                    defaultModel: 'previewOnly'
                }
            });

            // 如果有选中的文章，立即加载内容
            if (selectedPost) {
                try {
                    const response = await fetch(`/api/post/${selectedPost.id}/${selectedPost.current_version}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch post content');
                    }
                    const data = await response.json();
                    cherryRef.current.setValue(data.content);
                } catch (error) {
                    console.error('Error fetching post content:', error);
                }
            }
        };

        // 等待元素渲染完成
        initCherry();

        return () => {
            if (cherryRef.current) {
                cherryRef.current.destroy();
                cherryRef.current = null;
            }
        };
    }, [selectedPost]);

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
            {/* Left Sidebar */}
            <div className="w-[400px] border-r h-full flex flex-col">
                <div className="p-4 border-b space-y-4">
                    <h1 className="text-xl font-semibold">文章管理</h1>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="搜索文章..."
                            className="w-full px-4 py-2.5 border rounded-lg bg-background hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {getAllTags().map(tag => (
                            <Badge
                                key={tag}
                                variant={selectedTag === tag ? "default" : "secondary"}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className={cn(
                                    "select-none hover:bg-primary/20 hover:text-primary transition-all duration-200 border",
                                    selectedTag === tag
                                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground border-primary"
                                        : "border-muted-foreground/20"
                                )}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="overflow-auto flex-1">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => handlePostSelect(post)}
                            className={cn(
                                "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                                selectedPost?.id === post.id && "bg-muted"
                            )}
                        >
                            <div className="flex flex-col gap-2">
                                <h3 className="font-semibold text-lg truncate">
                                    {post.currentVersion?.title ?? post.postVersions[0].title}
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {post.currentVersion?.tags.map((tag: { tagName: string }) => (
                                        <span key={tag.tagName} className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                                            {tag.tagName}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">版本: {post.current_version}</span>
                                    <span>{format(post.create_time, "yyyy年MM月dd日")}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredPosts.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                            没有找到匹配的文章
                        </div>
                    )}
                </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 h-full overflow-auto px-8">
                {selectedPost ? (
                    <div className="">
                        <div className="flex items-center justify-between mb-6 py-6">
                            <h2 className="text-2xl font-semibold">
                                {selectedPost.currentVersion?.title ?? selectedPost.postVersions[0].title}
                            </h2>
                            <PostActionButtons
                                post={selectedPost}
                                handleChange={handleChange}
                            />
                        </div>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div id="cherry-markdown" className="h-[calc(100vh-200px)] border">
                                <style>
                                    {`
                                        .cherry-markdown {
                                            border: none !important;
                                            box-shadow: none !important;
                                            padding: 0 !important;
                                        }
                                        .cherry {
                                            box-shadow: none !important;
                                        }
                                        .cherry-editor,
                                        .cherry-previewer {
                                            box-shadow: none !important;
                                        }
                                    `}
                                </style>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Select a post to view details
                    </div>
                )}
            </div>
        </div>
    );
}

PostEdit.auth = true;
