import z from "zod";
import { ForbiddenError, NotFoundError } from "../errors";
import { getAllCustomers, getCustomerById, insertCustomer, updateCustomer } from "../repositories/customers.repository";
import { getEmployeeByUserId } from "../repositories/employees.repository";
import { CreateCustomerSchema, UpdateCustomerSchema } from "../validations/customers.schema";


export async function getCustomers(userId: string){
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        throw new ForbiddenError("Access denied");
    }
    const business_id = employee.business_id;
    return await getAllCustomers(business_id)
}

export async function getCustomer(
    userId: string,
    customerId: number
){
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        throw new ForbiddenError('Access denied');
    }

    const business_id = employee.business_id;

    const customer = await getCustomerById(customerId, business_id);
    if(!customer){
        throw new NotFoundError('Customer not found')
    }
    return customer;
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

export async function updateCustomerById(
    userId: string,
    customerId: number,
    data: z.infer<typeof UpdateCustomerSchema>,
){
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        throw new ForbiddenError('Access denied')
    }

    const business_id = employee.business_id;

    const updatedCustomer = await updateCustomer(customerId, business_id, data);
    if(!updatedCustomer){
        throw new NotFoundError('Customer not found');
    }
    return updatedCustomer;
}