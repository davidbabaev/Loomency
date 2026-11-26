"use server"

import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { createTestCustomerMessage } from "@/lib/services/messages.service";
import { headers } from "next/headers";
import z from "zod"

// at the top, every exported function in this file becomes a server action. the browser can call sendtestMessage, but its code runs only on the server.

const TestMessageSchama = z.object({
    convsrsationId: z.number().int().positive(),
    text: z.string().trim().min(1).max(4096),
});

type ActionResult = {ok: true} | {ok: false; error: string};

export async function sendTestMessage(conversationId: number, text: string) : Promise<ActionResult>{
    const parsed = TestMessageSchama.safeParse({conversationId, text});
    if(!parsed.success){
        console.error("Invalid test message:", parsed.error.issues)
        return {ok: false, error: "The message must be between 1 and 4096 characters"};
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if(!session){
        return {ok: false, error: "Unauthorized"};
    }

    try{
        await createTestCustomerMessage(
            session.user.id,
            parsed.data.convsrsationId,
            parsed.data.text
        );
        return {ok: true};
    }
    catch(err){
        if(err instanceof AppError){
            return {ok: false, error: err.message};
        }
        console.error("sendTestMessage", err);
        return{ok: false, error: "Something went wrong"};
    }
}