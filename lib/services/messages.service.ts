import z from "zod";
import { createMessageRepo, getMessagesByConversationIdRepo } from "../repositories/messages.repository";
import { getConversationById } from "./conversations.service";
import { CreateMessageSchema } from "../validations/messages.schema";
import { getEmployeeByUserId } from "../repositories/employees.repository";


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

export async function createMessage(
    userId: string,
    conversationId: number,
    data: z.infer<typeof CreateMessageSchema>,
) {
    const conversation = await getConversationById(userId, conversationId);
    if(!conversation){
        return null;
    }

    const business_id = conversation.business_id;

    // <- write-specific part goes here
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        return null;
    }

    // still to come: build the message, insert it
    const newMessage = {
        conversation_id: conversationId,
        business_id: business_id,
        sender_type: 'employee' as const,
        sender_employee_id: employee.employee_id,
        ...data,
    };

    const created = await createMessageRepo(newMessage);
    return created;
}