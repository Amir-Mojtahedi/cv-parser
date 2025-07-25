import { auth } from "@/features/authentication/auth";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const isLoginPage = nextUrl.pathname === "/login";
  const isSignupPage = nextUrl.pathname === "/signup";
  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");

  if ((isLoginPage || isSignupPage) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isDashboardPage && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});
