import { ForbiddenError, NotFoundError } from "../errors";
import { getBusinessById } from "../repositories/businesses.repository";
import { getEmployeeByUserId } from "../repositories/employees.repository";

export async function getMyBusiness(userId: string){
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        throw new ForbiddenError('Access denied');
    }

    const business_id = employee.business_id;
    const business = await getBusinessById(business_id);
    if(!business){
        throw new NotFoundError('Business not found')
    }
    return business;
}