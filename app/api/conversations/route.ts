// route handler

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createConversation, getConversations } from "@/lib/services/conversations.service";
import { CreateConversationSchema } from "@/lib/validations/conversations.schema";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const userId: string = session.user.id;
    const conversations = await getConversations(userId);

    if(!conversations) {
        return NextResponse.json({error: 'Forbidden'}, {status: 403});
    }
    
    return NextResponse.json(conversations);
}

export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(), 
    }); 

    if(!session){
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const userId: string = session.user.id;

    const body = await request.json();
    const result = CreateConversationSchema.safeParse(body);

    if(!result.success){
        return NextResponse.json({error: "Invalid request body"}, {status: 400});
    }

    const newConversation = await createConversation(userId, result.data)

    if(!newConversation) {
        return NextResponse.json({error:'Forbidden'}, {status: 403});
    }

    return NextResponse.json(newConversation, {status: 201});
}