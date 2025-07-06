import { NextResponse } from "next/server";

export function middleware(request) {
  console.log("[middleware] Request to:", request.nextUrl.pathname);
  return NextResponse.next();
}
