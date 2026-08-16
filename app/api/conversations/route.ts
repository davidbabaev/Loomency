// route handler

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createConversation, getConversations } from "@/lib/services/conversations.service";
import { CreateConversationSchema } from "@/lib/validations/conversations.schema";
import { AppError } from "@/lib/errors";
import z from "zod";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const userId: string = session.user.id;

    try{
        const conversations = await getConversations(userId);
        return NextResponse.json(conversations);
    } 
    catch(error){
        if(error instanceof AppError){
            return NextResponse.json(
                {error: error.message},
                {status: error.statusCode},
            )
        }
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
    
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
        return NextResponse.json(
            {error: z.flattenError(result.error)}, 
            {status: 400}
        );
    }

    try{
        const newConversation = await createConversation(userId, result.data)
        return NextResponse.json(newConversation, {status: 201});
    }
    catch(error){
        if(error instanceof AppError) {
            return NextResponse.json(
                {error: error.message},
                {status: error.statusCode},
            )
        }
        return NextResponse.json({error:'Internal server error'}, {status: 500});
    }


}