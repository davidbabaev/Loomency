// the Service - chef (logic)

import { getAllConversations } from "../repositories/conversations.repository";
import { getEmployeeByUserId } from "../repositories/employees.repository";


export async function getConversations(userId: string) {
    const employee = await getEmployeeByUserId(userId)
    if(!employee){
        throw new Error('No employee found fo this user')
    }
    const business_id = employee.business_id

    return await getAllConversations(business_id)
}