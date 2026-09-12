import z from "zod";

export const CreateEmployeeSchema = z.object({
    email: z.email(),
    role: z.enum(['admin', 'member'])
})