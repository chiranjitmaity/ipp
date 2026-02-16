
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Allow access to the login page itself
        if (req.nextUrl.pathname === "/admin/login") {
            return NextResponse.next();
        }

        if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                // Always authorize the login page
                if (req.nextUrl.pathname === "/admin/login") return true;
                // Require token for other admin pages
                return !!token;
            },
        },
        secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev',
    }
);

export const config = {
    matcher: ["/admin/:path*"],
};
