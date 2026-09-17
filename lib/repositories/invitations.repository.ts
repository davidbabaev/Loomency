import z from "zod";
import { invitations } from "../db/schema";

type NewInvitation = typeof invitations.$inferInsert;

export async function insertInvitation(data: NewInvitation){
    
}