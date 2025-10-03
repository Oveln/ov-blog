import { PrismaClient } from "@prisma/client";
import { getRequiredEnvVar } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: getRequiredEnvVar("DATABASE_URL"),
            },
        },
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
