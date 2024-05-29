// 获取命令行参数，增加或删除用户

import { PrismaClient } from "@prisma/client";
import { argv } from "process";

const usage = "Usage: bun usermanager.ts add|delete|change";
const action = argv[2];

const prisma = new PrismaClient();

async function addUser() {
    const usage = "Usage: bun usermanager.ts add username useremail role";
    const username = argv[3];
    const useremail = argv[4];
    const role = argv[5];
    if (role !== "ADMIN" && role !== "USER") {
        console.error(usage);
        console.error("Invalid role type (ADMIN|USER)");
        process.exit(1);
    }
    if (!username || !useremail) {
        console.error(usage);
        process.exit(1);
    }
    try {
        await prisma.user.create({
            data: {
                name: username,
                email: useremail,
                role: role
            }
        });
    } catch (e) {
        console.error(`User ${username} already exists`)
        process.exit(1);
    }
    console.log("User added");
}

async function delUser() {
    const usage = "Usage: bun usermanager.ts delete username";
    const username = argv[3];
    if (!username) {
        console.error(usage);
        process.exit(1);
    }
    try {
        await prisma.user.delete({
            where: {
                name: username
            }
        });
    } catch (e) {
        console.error(`User ${username} not found`)
        process.exit(1);
    }
    console.log("User deleted");
}

async function changeUser() {
    const usage = "Usage: bun usermanager.ts change username role";
    const username = argv[3];
    const role = argv[4];
    if (role !== "ADMIN" && role !== "USER") {
        console.error("Invalid role type (ADMIN|USER)");
        process.exit(1);
    }
    if (!username || !role) {
        console.error(usage);
        process.exit(1);
    }
    if (role === "ADMIN" || role === "USER") {
        try {
            await prisma.user.update({
                where: {
                    name: username
                },
                data: {
                    role: role
                }
            });
        } catch (e) {
            console.error(`User ${username} not found`)
            process.exit(1);
        }
    } else {
        console.error("Invalid role");
        process.exit(1);
    }
    console.log(`User ${username} role changed to ${role}`);
}

switch (action) {
    case "add":
        await addUser();
        break;
    case "del" || "delete":
        await delUser();
        break;
    case "change":
        await changeUser();
        break;
    default:
        console.error(usage);
        process.exit(1);
}
