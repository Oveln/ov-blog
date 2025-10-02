import NextAuth, { User } from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, Role } from "@prisma/client";
import { getUserCount, setUserRole } from "../db";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [GitHub],
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async session({ session }) {
            if (session.user) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: session.user.email },
                });
                session.user.role = dbUser?.role || Role.GUEST;
            }
            return session;
        },
    },
    events: {
        createUser: async (message: { user: User }) => {
            // 如果是第一个用户，将其设置为管理员
            if ((await getUserCount()) == 1 && message.user.id) {
                setUserRole(message.user.id, Role.ADMIN);
            }
        },
    },
});
