import z from "zod";
import { ForbiddenError } from "../errors";
import { getAllCustomers, insertCustomer } from "../repositories/customers.repository";
import { getEmployeeByUserId } from "../repositories/employees.repository";
import { CreateCustomerSchema } from "../validations/customers.schema";


export async function getCustomers(userId: string){
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        throw new ForbiddenError("Access denied");
    }
    const business_id = employee.business_id;
    return await getAllCustomers(business_id)
}

export async function createCustomer(
    userId: string,
    data: z.infer<typeof CreateCustomerSchema>,
){
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        throw new ForbiddenError("Access denied");
    }

    const newCustomer = await insertCustomer({
        ...data,
        business_id: employee.business_id,
    })

    return newCustomer;
}