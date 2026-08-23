import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { getCustomer, updateCustomerById } from "@/lib/services/customers.service";
import { UpdateCustomerSchema } from "@/lib/validations/customers.schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";


export async function GET(
    request: Request,
    context: {params: Promise<{id: string}>}
){
    const {id} = await context.params;
    const customerId = Number(id);

    if(Number.isNaN(customerId)){
        return NextResponse.json({error: 'Invalid customer ID'}, {status: 400})
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if(!session){
        return NextResponse.json({error: 'Unathorized'}, {status: 401});
    }

    const userId = session.user.id;

    try{
        const customer = await getCustomer(userId, customerId)
        return NextResponse.json(customer);
    }
    catch(error){
        if(error instanceof AppError){
            return NextResponse.json(
                {error: error.message},
                {status: error.statusCode},
            )
        }
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}

export async function PATCH(
    request: Request,
    context: {params: Promise<{id: string}>}
){
    const {id} = await context.params;
    const customerId = Number(id);
    
    if(Number.isNaN(customerId)){
        return NextResponse.json({error: 'Invalid customer ID'}, {status: 400});
    }

    const session = await auth.api.getSession({
        headers: await headers()
    })
    if(!session){
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const userId = session.user.id; // Who's asking - from the session
    const body = await request.json(); // what they sent - from the request

    const result = UpdateCustomerSchema.safeParse(body);
    if(!result.success){
        return NextResponse.json(
            {error: z.flattenError(result.error)},
            {status: 400},
        )
    }

    try{
        const updatedCustomer = await updateCustomerById(
            userId,
            customerId,
            result.data
        );
        return NextResponse.json(updatedCustomer);
    }
    catch(error){
        if(error instanceof AppError){
            return NextResponse.json(
                {error: error.message},
                {status: error.statusCode},
            )
        }
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}