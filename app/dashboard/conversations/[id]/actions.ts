"use server"

import z from "zod"

// at the top, every exported function in this file becomes a server action. the browser can call sendtestMessage, but its code runs only on the server.

const TestMessageSchama = z.object({
    convsrsationId: z.number().int().positive(),
    text: z.string().trim().min(1).max(4096),
});

type ActionResult = {ok: true} | {ok: false; error: string};