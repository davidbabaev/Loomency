import z from "zod";

export const CreateMessageSchema = z.object({
    message_text: z.string().min(1).max(4096).optional(),
    message_media_url: z.url().optional(),
    message_media_type: z.enum(["image", "video", "audio", "document"]).optional(),
}).refine(
    (data) => data.message_text || data.message_media_url,
    { message: "Message must have text or media" }
);