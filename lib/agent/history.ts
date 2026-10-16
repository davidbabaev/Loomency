import { messages } from "../db/schema";
import { ChatMessage } from "../llm/claude.client";

type Message = typeof messages.$inferSelect;

export function toChatMessage(row: Message): ChatMessage {
    const role = row.sender_type === "customer" ? "user" : "assistant";
    const content = row.message_text ?? "[An image or file was sent]";

    return {role, content};
}

export function toChatMessages(rows: Message[]): ChatMessage[] {
    return rows.map(toChatMessage);
}