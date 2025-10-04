import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
    const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
    const cookies = req.cookies;
    const sessionToken = cookies.get("authjs.session-token");

    if (isDashboard && !sessionToken) {
        console.log("No session token found, redirecting to login.", sessionToken);
        return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
