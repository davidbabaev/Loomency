import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { runAgentForUser } from "@/lib/services/agent.service";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    context: {params: Promise<{id: string}>}
) {
    const {id} = await context.params;
    const conversationId = Number(id);

    if(Number.isNaN(conversationId)){
        return NextResponse.json({error: "Invalid conversation ID"}, {status: 400});
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if(!session) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const userId = session.user.id;

    try{
        const reply = await runAgentForUser(userId, conversationId);
        return NextResponse.json({reply});
    }
    catch(error){
        if(error instanceof AppError){
            return NextResponse.json({error: error.message}, { status: error.statusCode});
        }
    }
}