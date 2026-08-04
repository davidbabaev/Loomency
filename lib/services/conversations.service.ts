// the Service - chef (logic)

import { getAllConversations, getConversationByIdRepo, insertConversation } from "../repositories/conversations.repository";
import { getCustomerById } from "../repositories/customers.repository";
import { getEmployeeByUserId } from "../repositories/employees.repository";
import { CreateConversationInput } from "../validations/conversations.schema";


export async function getConversations(userId: string) {
    const employee = await getEmployeeByUserId(userId)
    if(!employee){
        return null;
    }
    const business_id = employee.business_id

    return await getAllConversations(business_id)
}

export async function getConversationById(userId: string, conversationId: number) {
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        return null
    }

    return await getConversationByIdRepo(conversationId, employee.business_id);
}

export async function createConversation(
    userId: string, 
    data: CreateConversationInput
) {
    const employee = await getEmployeeByUserId(userId);

    if(!employee){
        return null;
    }

    // ↓↓↓ NEW ↓↓↓
    const customer = await getCustomerById(data.customer_id);
    if(!customer || customer.business_id !== employee.business_id ){
        return null;
    }

    // ___________
    const newConversation = await insertConversation({
        ...data,
        business_id: employee.business_id
    });

    return newConversation;
}