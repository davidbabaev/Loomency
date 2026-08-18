import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { getCustomers } from "@/lib/services/customers.service";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(){
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if(!session){
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const userId: string = session.user.id;

    try{
        const customers = await getCustomers(userId);
        return NextResponse.json(customers);
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