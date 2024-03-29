import { defineDocumentType } from "contentlayer/source-files";
import { spawn } from "node:child_process";
import { makeSource } from "contentlayer/source-remote-files";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";

const PrettyCodeoptions = {
  // See Options section below.
  theme: "github-dark",
  defaultLang: {
    block: "bash",
    inline: "plaintext"
  }
};

const Post = defineDocumentType(() => ({
    name: "Post",
    filePathPattern: `博客/*.md`,
    contentType: "mdx",
    fields: {
        title: {
            type: "string",
            required: false
        },
        description: {
            type: "string",
            required: false
        },
        create_time: {
            type: "date",
            required: true
        },
        update_time: {
            type: "date",
            required: true
        },
        id: {
            type: "number",
            required: true
        },
        tags: {
            type: "list",
            of: {
                type: "string"
            },
            required: true
        }
    },
    computedFields: {
        url: {
            type: "string",
            resolve: (doc) => `/blogs/${doc.id}`
        },
        computedTitle: {
            type: "string",
            resolve: (post) => post.title ? post.title : post._raw.sourceFileName.replace(".md", "")
        }
    }
}));

const syncContentFromGit = async (contentDir: string) => {
    const syncRun = async () => {
        const gitUrl = "git@gitee.com:oveln/ovenlife.git";
        await runBashCommand(`
      if [ -d  "${contentDir}" ];
        then
          cd "${contentDir}"; git pull;
        else
          git clone --depth 1 --single-branch ${gitUrl} ${contentDir};
      fi
    `);
    };

    let wasCancelled = false;
    let syncInterval: string | number | NodeJS.Timeout | undefined;

    const syncLoop = async () => {
        console.log("Syncing content files from git");

        await syncRun();

        if (wasCancelled) return;

        syncInterval = setTimeout(syncLoop, 1000 * 60);
    };

    // Block until the first sync is done
    await syncLoop();

    return () => {
        wasCancelled = true;
        clearTimeout(syncInterval);
    };
};

const runBashCommand = (command: string) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, [], { shell: true });

        child.stdout.setEncoding("utf8");
        child.stdout.on("data", (data) => process.stdout.write(data));

        child.stderr.setEncoding("utf8");
        child.stderr.on("data", (data) => process.stderr.write(data));

        child.on("close", function (code) {
            if (code === 0) {
                resolve(void 0);
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
    });
export default makeSource({
    syncFiles: syncContentFromGit,
    contentDirPath: ".contentlayer/ovenlife",
    contentDirInclude: ["博客"],
    documentTypes: [Post],
    disableImportAliasWarning: true,
    mdx: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatex, rehypeStringify,[rehypePrettyCode, PrettyCodeoptions]]
    }
});
