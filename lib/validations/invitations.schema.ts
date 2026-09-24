import z from "zod";

export const AcceptInvitationSchema = z.object({
    token: z.string().min(1),
});