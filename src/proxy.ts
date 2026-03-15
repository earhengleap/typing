import { auth } from "./auth";
import { NextResponse } from "next/server";

export const proxy = auth((req: any) => {
    const { nextUrl } = req;
    
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;
    const isAdmin = userRole === "admin" || userRole === "superadmin";

    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isLoginPage = nextUrl.pathname === "/admin/login";
    const isAuthPage = ["/login", "/admin/login"].some(path => nextUrl.pathname === path);
    const isUserRoute = ["/account", "/account-settings"].some(path => nextUrl.pathname.startsWith(path));

    // Redirect logged-in users away from auth pages
    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Admin Protection
    if (isAdminRoute && !isLoginPage) {
        if (!isLoggedIn || !isAdmin) {
            return NextResponse.redirect(new URL("/admin/login", nextUrl));
        }
    }

    // User Protection
    if (isUserRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
