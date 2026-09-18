import z from "zod";

export async function createInvitation(
    userId: string,
    data: z.infer<typeof CreateEm>
){}