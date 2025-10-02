import http from "http";
import createHandler from "github-webhook-handler";
import { env } from "process";
import { exec } from "child_process";

const WEBHOOK_SECRET = env.WEBHOOK_SECRET;
// 监听端口
const PORT = 7777;
// 监听分支
const BANCH = ["refs/heads/main"];

if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET 请设置环境变量");
    process.exit(1);
}

const handler = createHandler({ path: "/", secret: WEBHOOK_SECRET });

http.createServer((req, res) => {
    handler(req, res, () => {
        res.statusCode = 404;
        res.end("no such location");
    });
}).listen(PORT);

handler.on("error", (err) => {
    console.error("Error:", err.message);
});

handler.on("push", (event) => {
    console.log(
        `[${new Date().toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai",
        })}] Received a push event from ${event.payload.pusher.name} to ${event.payload.ref}`
    );
    if (!BANCH.includes(event.payload.ref)) {
        console.log("不在处理分支内，不进行操作");
        return;
    } else {
        console.log("处理分支内，开始更新");
    }
    exec(`make update`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            console.error(
                `[${new Date().toLocaleString("zh-CN", {
                    timeZone: "Asia/Shanghai",
                })}]${event.payload.ref} 更新失败`
            );
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        console.log(
            `[${new Date().toLocaleString("zh-CN", {
                timeZone: "Asia/Shanghai",
            })}]${event.payload.ref} 更新完成`
        );
    });
});

handler.on("ping", () => {
    console.warn(
        `[${new Date().toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai",
        })}] Received a ping event`
    );
});
