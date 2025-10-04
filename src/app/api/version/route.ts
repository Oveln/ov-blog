import { Version } from "@/lib/version";
import { NextResponse } from "next/server";

export async function GET() {
    const version = Version.getInstance();
    return NextResponse.json(version.toJSON());
}
