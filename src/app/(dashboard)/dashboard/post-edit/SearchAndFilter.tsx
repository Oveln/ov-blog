import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface SearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
    tags: string[];
}

export function SearchAndFilter({
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    tags,
}: SearchAndFilterProps) {
    return (
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 space-y-5 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                    文章管理
                </h1>
                {(searchTerm || selectedTag) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchTerm("");
                            setSelectedTag(null);
                        }}
                        className="text-xs h-7"
                    >
                        <X className="h-3 w-3 mr-1" />
                        清除筛选
                    </Button>
                )}
            </div>

            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="搜索文章标题..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {tags.length > 0 && (
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        标签筛选
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant={selectedTag === tag ? "default" : "secondary"}
                                onClick={() =>
                                    setSelectedTag(selectedTag === tag ? null : tag)
                                }
                                className={cn(
                                    "cursor-pointer select-none transition-all duration-200 border hover:scale-105 active:scale-95",
                                    selectedTag === tag
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-sm"
                                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/10"
                                )}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
