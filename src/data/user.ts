import { auth } from "@/lib/auth/auth";
import { getUserByName } from "./db";

export type User = {
    name: string;
    email: string;
    role: Role;
};
export enum Role {
    ADMIN = 0,
    USER = 1,
    GUEST = 2
}

// 鉴权函数
export function checkAuth(user: User, role: Role): boolean {
    return user.role <= role;
}

// 权限string to enum
export function roleStringToEnum(role: string): Role {
    switch (role) {
        case "ADMIN":
            return Role.ADMIN;
        case "USER":
            return Role.USER;
        case "GUEST":
            return Role.GUEST;
        default:
            throw new Error("Invalid role");
    }
}

// enum to string
export function roleEnumToString(role: Role): string {
    switch (role) {
        case Role.ADMIN:
            return "ADMIN";
        case Role.USER:
            return "USER";
        case Role.GUEST:
            return "GUEST";
        default:
            throw new Error("Invalid role");
    }
}

export async function getUser(): Promise<User | null> {
    const session = await auth();
    const userName = session?.user?.name;
    if (!userName) {
        return null;
    }
    return getUserByName(userName);
}
