import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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
        <div className="space-y-4 mb-8">
            <div className="relative">
                <Input
                    type="text"
                    placeholder="搜索文章..."
                    className="w-full px-4 py-2.5 border rounded-lg bg-background hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-mono"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <Badge
                        key={tag}
                        variant={selectedTag === tag ? "default" : "secondary"}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={cn(
                            "select-none hover:bg-primary/20 hover:text-primary transition-all duration-200 border cursor-pointer font-mono",
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
    );
} 