// route handler

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getConversations } from "@/lib/services/conversations.service";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const userId: string = session.user.id;
    const conversations = await getConversations(userId);
    
    return NextResponse.json(conversations);
}