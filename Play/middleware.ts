import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { COOKIE_TOKEN_KEY } from "./lib/constants";

// Define which paths are accessible without authentication
const publicPaths = ["/signin", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;

  // Check if the path is public
  const isPublicPath = publicPaths.some((publicPath) =>
    path.startsWith(publicPath)
  );

  // Get the authentication token from cookies
  const token = request.cookies.get(COOKIE_TOKEN_KEY)?.value;

  // If the path is not public and there's no token, redirect to signin
  if (!isPublicPath && !token) {
    const url = new URL("/signin", request.nextUrl.origin);

    // Add the original URL as a query parameter to redirect after login
    if (!publicPaths.includes(request.nextUrl.pathname)) {
      url.searchParams.set(
        "cb",
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
    }

    return NextResponse.redirect(url);
  }

  // If the path is public and there's a token, redirect to home
  if (token) {
    if (isPublicPath || path === "/") {
      return NextResponse.redirect(
        new URL("/channels", request.nextUrl.origin)
      );
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     * - api routes that don't require authentication
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api/public).*)",
  ],
};
