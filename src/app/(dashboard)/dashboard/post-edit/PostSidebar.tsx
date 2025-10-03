import { SearchAndFilter } from "./SearchAndFilter";
import { PostList } from "./PostList";
import type { TRPCUserPost } from "./types";

interface PostSidebarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
    tags: string[];
    posts: TRPCUserPost[];
    selectedPost: TRPCUserPost | null;
    onPostSelect: (post: TRPCUserPost) => void;
}

export function PostSidebar({
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    tags,
    posts,
    selectedPost,
    onPostSelect,
}: PostSidebarProps) {
    return (
        <aside className="w-[380px] border-r border-gray-200 dark:border-gray-800 h-full flex flex-col bg-white dark:bg-gray-950 shadow-lg">
            <SearchAndFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                tags={tags}
            />
            <div className="flex-1 overflow-y-auto">
                <PostList
                    posts={posts}
                    selectedPost={selectedPost}
                    onPostSelect={onPostSelect}
                />
            </div>
        </aside>
    );
}
