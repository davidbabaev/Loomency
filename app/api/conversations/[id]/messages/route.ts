// 3 imports

import { auth } from "@/lib/auth";
import { getMessagesByConversationId, createMessage } from "@/lib/services/messages.service";
import { CreateMessageSchema } from "@/lib/validations/messages.schema";
import { error } from "console";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET - what gety needs:
// headers - is Next's function for reading the incoming request's headers, and betterauth needs them because the session token rides in the coockie header. 
// ifs
// NextResponse is how you build the HTTP response you send back.
// auth - is your BetterAuth instance - the thing that can read a session.
// getSession - reads the coockie and tells you who's logged in, or null if nobody is.
// return - in the guard atters for two reasons

export async function GET(
    request: Request,
    // params promise (not params: --> context:)
    context: {params: Promise<{id: string}>}
){
    const {id} = await context.params;
    const conversationId = Number(id);
    // if
    if(Number.isNaN(conversationId)){
        return NextResponse.json({error: 'Invalid conversation ID'}, {status: 400})
    }

    // getSession
    const session = await auth.api.getSession({
        // headers
        headers: await headers(),
    });

    if(!session){
        // response
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const userId: string = session.user.id;
    // reading a value out of nested object.

    const messages = await getMessagesByConversationId(userId, conversationId);

    if(!messages){
        return NextResponse.json({error: 'Not found'}, {status: 404});
    }

    return NextResponse.json(messages);
} 

export async function POST(
    request: Request,
    context: {params: Promise<{id: string}>},
){

    const {id} = await context.params;
    const conversationId = Number(id);

    if(Number.isNaN(conversationId)){
        return NextResponse.json({error: 'Invalid conversation ID'}, {status: 400})
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if(!session){
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const userId: string = session.user.id;
    const body = await request.json();

    const result = CreateMessageSchema.safeParse(body);
    if(!result.success){
        return NextResponse.json({error:'Invalid request body'}, {status: 400})
    }

    const newMessage = await createMessage(userId, conversationId, result.data);

    if(!newMessage) {
        return NextResponse.json({error: 'Not Found'}, {status: 404});
    }

    return NextResponse.json(newMessage, {status: 201});
}