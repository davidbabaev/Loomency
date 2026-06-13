import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest){

    const sessionCookie = getSessionCookie(request);

    if(!sessionCookie && request.nextUrl.pathname.startsWith('/dashboard')){
        console.log('Proxy ran for:', request.nextUrl.pathname);
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}

