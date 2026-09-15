import z from "zod";
import { CreateEmployeeSchema } from "../validations/employees.schema";
import { getEmployeeByUserId, getUserByEmail, insertEmployee } from "../repositories/employees.repository";
import { ForbiddenError, NotFoundError } from "../errors";

export async function addEmployee(
    userId: string,
    data: z.infer<typeof CreateEmployeeSchema>,
){
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        throw new ForbiddenError('Access denied');
    }

    if(employee.role !== 'admin'){
        throw new ForbiddenError('Admin role required');
    }

    const invitedUser = await getUserByEmail(data.email);
    if(!invitedUser){
        throw new NotFoundError('No accound found with that email')
    }

    const newEmployee = await insertEmployee({
        ...data,
        business_id: employee.business_id,
    })

    return newEmployee;
}