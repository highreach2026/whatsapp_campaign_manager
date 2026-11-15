import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Meta must be able to reach this endpoint without dashboard auth.
  if (pathname.startsWith("/api/webhooks/whatsapp")) {
    return NextResponse.next();
  }

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  // During initial local setup, don't lock the dashboard if credentials are missing.
  // Production deployment should always set both variables.
  if (!username || !password) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const separator = decoded.indexOf(":");
      const suppliedUser = decoded.slice(0, separator);
      const suppliedPass = decoded.slice(separator + 1);
      if (suppliedUser === username && suppliedPass === password) {
        return NextResponse.next();
      }
    } catch {
      // fall through to challenge
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="High Reach WhatsApp Manager"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
