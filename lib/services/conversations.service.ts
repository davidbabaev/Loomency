// the Service - chef (logic)

import { getAllConversations } from "../repositories/conversations.repository";


export async function getConversations() {
    return await getAllConversations();
}