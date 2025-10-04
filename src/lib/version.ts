class Version {
    commitId: string | null = null;
    commitTime: Date | null = null;
    buildTime: Date | null = null;

    private static instance: Version;

    private constructor(metaPath: string = ".build-meta") {
        // Skip file reading if special path is provided (used in fromJSON)
        if (metaPath === "__DO_NOT_READ_FILE__") {
            return;
        }

        console.log("Bun:", typeof Bun !== "undefined");
        console.log("Node.js:", typeof window === "undefined");

        // Check if we're in a Bun/Node environment
        if (typeof Bun !== "undefined") {
            // Bun environment
            try {
                Bun.file(metaPath)
                    .text()
                    .then((meta) => {
                        this.parseMetaFile(meta);
                    })
                    .catch(() => {
                        // 无版本信息文件，保持默认值
                    });
            } catch {
                // 无版本信息文件，保持默认值
            }
        } else if (typeof window === "undefined") {
            // Node.js environment
            try {
                // Dynamically import fs to avoid bundling issues
                import("fs")
                    .then((fs) => {
                        if (fs.existsSync(metaPath)) {
                            const meta = fs.readFileSync(metaPath, "utf-8");
                            this.parseMetaFile(meta);
                        }
                    })
                    .catch(() => {
                        // 无版本信息文件，保持默认值
                    });
            } catch {
                // 无版本信息文件，保持 default values
            }
        }
        // If in browser environment, keep default null values
    }

    private parseMetaFile(meta: string) {
        for (const line of meta.split("\n")) {
            if (line.startsWith("GIT_COMMIT_ID=")) this.commitId = line.split("=")[1];
            if (line.startsWith("GIT_COMMIT_TIME=")) {
                const val = line.split("=")[1];
                this.commitTime = val ? new Date(val) : null;
            }
            if (line.startsWith("BUILD_TIME=")) {
                const val = line.split("=")[1];
                this.buildTime = val ? new Date(val) : null;
            }
        }
    }

    static getInstance(metaPath?: string) {
        if (!Version.instance) {
            Version.instance = new Version(metaPath);
        }
        return Version.instance;
    }

    toJSON() {
        return {
            commitId: this.commitId,
            commitTime: this.commitTime ? this.commitTime.toISOString() : null,
            buildTime: this.buildTime ? this.buildTime.toISOString() : null,
        };
    }

    static fromJSON(obj: {
        commitId: string | null;
        commitTime: string | null;
        buildTime: string | null;
    }): Version {
        const v = new Version("__DO_NOT_READ_FILE__"); // Pass a special path to avoid file reading
        v.commitId = obj.commitId ?? null; // Keep as null instead of empty string to match initialization
        v.commitTime = obj.commitTime ? new Date(obj.commitTime) : null;
        v.buildTime = obj.buildTime ? new Date(obj.buildTime) : null;
        return v;
    }
}

export { Version };
