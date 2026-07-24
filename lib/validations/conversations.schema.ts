import z from "zod";

export const CreateConversationSchema = z.object({
    customer_id: z.number(),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;