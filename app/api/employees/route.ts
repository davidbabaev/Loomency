import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { createInvitation } from "@/lib/services/invitations.service";
import { CreateEmployeeSchema } from "@/lib/validations/employees.schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if(!session){
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const userId = session.user.id;
    const body = await request.json();
    const result = CreateEmployeeSchema.safeParse(body);
    if(!result.success){
        return NextResponse.json(
            {error: z.flattenError(result.error)},
            {status: 400}
        )
    }

    try{
        const invitation = await createInvitation(userId, result.data);
        return NextResponse.json({
            invitation: invitation.invitation,
            inviteUrl: `http://localhost:3000/invite/${invitation.token}`
        }, {status: 201})
    }
    catch(error){
        if(error instanceof AppError){
            return NextResponse.json(
                {error: error.message},
                {status: error.statusCode},
            )
        }
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}