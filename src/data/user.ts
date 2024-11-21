import { auth } from "@/lib/auth/auth";
import { getUserById } from "../lib/db";
import { Role } from "@prisma/client";

export type User = {
    id: string,
    name: string | null;
    email: string | null;
    role: Role;
};

export async function getUser(): Promise<User | null> {
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
        return null;
    }
    return getUserById(userid);
}
