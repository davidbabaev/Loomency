import z from "zod";
import { invitations } from "../db/schema";
import { db } from "../db";
import { and, eq } from "drizzle-orm";

type NewInvitation = typeof invitations.$inferInsert;

export async function insertInvitation(data: NewInvitation){
    const [newInvitation] = await db
        .insert(invitations)
        .values(data)
        .returning();
    return newInvitation;
}

export async function getInvitationByTokenHash(tokenHash: string){
    const result = await db
        .select()
        .from(invitations)
        .where(eq(invitations.token_hash, tokenHash))
        .limit(1)
    return result[0];
}

export async function getPendingInvitationEmail(
    email: string, 
    business_id: number
){
    const result = await db
        .select()
        .from(invitations)
        .where(and(
            eq(invitations.email, email),
            eq(invitations.business_id, business_id),
            eq(invitations.status, 'pending')
        ))
        .limit(1)
    return result[0];
}

export async function markInvitationAccepted(invitation_id: number){
    const [updated] = await db
        .update(invitations)
        .set({
            status: 'accepted',
            accepted_at: new Date()
        })
        .where(eq(invitations.invitation_id, invitation_id))
        .returning();
    return updated;
}