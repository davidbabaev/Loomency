// We’ll build it in 5 pieces, one per message:
// The encoder ← now
// The pipe (ReadableStream) and closing it
// Running the agent and pushing words into the pipe
// Handling errors
// Returning the pipe to the browser

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
        return NextResponse.json({error: "Invalid conversation ID"}, {status: 400})
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if(!session){
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const userId = session.user.id;
    const encoder = new TextEncoder();


    const stream = new ReadableStream({
        async start(controller){

            try{
                await runAgentForUser(userId, conversationId, (text) => {
                    controller.enqueue(encoder.encode(text))
                });
            }
            catch(err){
                console.error("Agent stream failed:", err);
                const message = err instanceof AppError ? err.message : "Something went wrong";
                controller.enqueue(encoder.encode(`\n[Error: ${message}]`));
            }

            controller.close();
        },
    });

    return new Response(stream, {
        headers: {"Content-Type": "text/plain; charser=utf-8"},
    });
}