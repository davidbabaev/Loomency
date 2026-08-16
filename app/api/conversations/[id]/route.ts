import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { getConversationById } from "@/lib/services/conversations.service";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    context: {params: Promise<{id: string}>}
) {
    const {id} = await context.params;
    const conversationId = Number(id);

    if(Number.isNaN(conversationId)){
        return NextResponse.json({error:"Invalid conversation ID"}, {status: 400});
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        return NextResponse.json({error: 'Unatuhorized'}, {status: 401})
    }

    const userId: string = session.user.id;

    try{
        const conversation = await getConversationById(userId, conversationId);
        return NextResponse.json(conversation);

    }
    catch(error){
        if(error instanceof AppError) {
            return NextResponse.json(
                {error: error.message},
                {status: error.statusCode}
            )
        }
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}