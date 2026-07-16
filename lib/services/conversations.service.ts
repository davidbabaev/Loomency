// the Service - chef (logic)

import { getAllConversations } from "../repositories/conversations.repository";


export async function getConversations(business_id: number) {
    return await getAllConversations(business_id);
}