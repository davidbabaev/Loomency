import z from "zod";

export const CreateCustomerSchema = z.object({
    customer_name: z.string().min(1).max(400).optional(),
    customer_lastname: z.string().min(1).max(400).optional(),
    phone_number: z.string().min(7).max(20),
})

export const UpdateCustomerSchema = CreateCustomerSchema.partial().refine(
    (data) => data.customer_name || data.customer_lastname || data.phone_number,
    {message: "At least one field must be provided"}
);