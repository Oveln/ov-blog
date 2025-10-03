export function EmptyState() {
    return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        请选择文章
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        从左侧列表中选择一篇文章进行查看或编辑
                    </p>
                </div>
            </div>
        </div>
    );
}
