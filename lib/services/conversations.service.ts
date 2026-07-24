// the Service - chef (logic)

import { getAllConversations, insertConversation } from "../repositories/conversations.repository";
import { getEmployeeByUserId } from "../repositories/employees.repository";
import { CreateConversationInput } from "../validations/conversations.schema";


export async function getConversations(userId: string) {
    const employee = await getEmployeeByUserId(userId)
    if(!employee){
        throw new Error('No employee found for this user')
    }
    const business_id = employee.business_id

    return await getAllConversations(business_id)
}

export async function createConversation(
    userId: string, 
    data: CreateConversationInput
) {
    const employee = await getEmployeeByUserId(userId);

    if(!employee){
        return null;
    }

    const newConversation = await insertConversation({
        ...data,
        business_id: employee.business_id
    });

    return newConversation;
}