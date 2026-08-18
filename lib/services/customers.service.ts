import { ForbiddenError } from "../errors";
import { getAllCustomers } from "../repositories/customers.repository";
import { getEmployeeByUserId } from "../repositories/employees.repository";


export async function getCustomers(userId: string){
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        throw new ForbiddenError("Access denied");
    }
    const business_id = employee.business_id;
    return await getAllCustomers(business_id)
}