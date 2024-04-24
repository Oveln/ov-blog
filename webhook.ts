import http from "http";
import createHandler from "github-webhook-handler";
import { env } from "process";
import { exec } from "child_process";

const WEBHOOK_SECRET = env.WEBHOOK_SECRET;

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
}).listen(7777);

handler.on("error", (err) => {
    console.error("Error:", err.message);
});

handler.on("push", () => {
    exec(`make update`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
});

handler.on("ping", ()=> {
    console.log("ping");
})