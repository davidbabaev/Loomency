// route handler

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getConversations } from "@/lib/services/conversations.service";
import z from "zod";

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

const CreateConversationSchema = z.object({
    customer_id: z.number(),
})

export async function POST(request: Request) {
    const body = await request.json();
    return NextResponse.json(body);
}