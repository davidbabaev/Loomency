import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { createCustomer, getCustomers } from "@/lib/services/customers.service";
import { CreateCustomerSchema } from "@/lib/validations/customers.schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

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

export async function POST(request: Request){
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const userId: string = session.user.id;

    const body = await request.json();

    const result = CreateCustomerSchema.safeParse(body);
    if(!result.success){
        return NextResponse.json(
            {error: z.flattenError(result.error)},
            {status: 400}
        );
    }

    try{
        const newCustomer = await createCustomer(userId, result.data) 
    }
    catch(error){
        
    }
}