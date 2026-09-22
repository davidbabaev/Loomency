import z from "zod";
import { CreateEmployeeSchema } from "../validations/employees.schema";
import { getEmployeeByUserId } from "../repositories/employees.repository";
import { ConflictError, ForbiddenError } from "../errors";
import { getPendingInvitationEmail, insertInvitation } from "../repositories/invitations.repository";
import { generateToken, hashToken } from "../tokens";

export async function createInvitation(
    userId: string,
    data: z.infer<typeof CreateEmployeeSchema>
){
    const employee = await getEmployeeByUserId(userId);
    if(!employee){
        throw new ForbiddenError('Access denied')
    }
    
    if(employee.role !== 'admin'){
        throw new ForbiddenError('Admin role required')
    }

    const existing = await getPendingInvitationEmail(data.email, employee.business_id)
    if(existing){
        throw new ConflictError('An invitation is already pending for this email');
    }

    const token =  generateToken();
    const hashedToken = hashToken(token);

    const expired = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // const insert = await insertInvitation()
}