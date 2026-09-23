import z from "zod";
import { CreateEmployeeSchema } from "../validations/employees.schema";
import { getEmployeeByUserAndBusiness, getEmployeeByUserId, getUserById } from "../repositories/employees.repository";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors";
import { getInvitationByTokenHash, getPendingInvitationEmail, insertInvitation } from "../repositories/invitations.repository";
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

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newInvitation = await insertInvitation({
        email: data.email,
        business_id: employee.business_id,
        role: data.role,
        invited_by_employee_id: employee.employee_id,
        token_hash: hashedToken,
        expires_at: expiresAt,
    });

    return {invitation: newInvitation, token};
}

export async function acceptInvitation(userId: string, rawToken: string){
    const hashedToken = hashToken(rawToken);
    const invitation = await getInvitationByTokenHash(hashedToken);

    if(!invitation){
        throw new NotFoundError('Invalid invitation');
    }
    if(invitation.status !== 'pending'){
        throw new ConflictError('Invitation is no longer valid');
    }
    if(invitation.expires_at < new Date()){
        throw new ConflictError('Invitation has expired');
    }

    const currentUser = await getUserById(userId);
    if(!currentUser){
        throw new NotFoundError('Not found');
    }
    if(currentUser.email !== invitation.email){
        throw new ForbiddenError('This invitation is not for your account');
    }

    const existingEmployee = await getEmployeeByUserAndBusiness(userId, invitation.business_id);
    if(existingEmployee){
        throw new ConflictError('You are already a memeber of this business');
    }

    // return await db.transa
}