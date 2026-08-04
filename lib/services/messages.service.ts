import { getMessagesByConversationIdRepo } from "../repositories/messages.repository";
import { getConversationById } from "./conversations.service";


export async function getMessagesByConversationId(
    userId: string, 
    conversationId: number
) {
    const conversation = await getConversationById(userId, conversationId);
    if(!conversation){
        return null;
    }

    const business_id = conversation.business_id;

    return await getMessagesByConversationIdRepo(conversationId, business_id);
}