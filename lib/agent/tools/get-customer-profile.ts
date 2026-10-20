import { ToolCard } from "@/lib/llm/claude.client";
import { ToolContext } from "./tool-context";
import { getCustomerById } from "@/lib/repositories/customers.repository";
import { NotFoundError } from "@/lib/errors";

export const getCustomerProfileCard: ToolCard = {
    name: "get_customer_profile",
    description:
        "Returns the name and phone number of the customer you are currently talking to. " +
        "Use it to greet the customer by name, or to confirm the phone number on file when they ask for a callback. " +
        "It takes no input. It always returns the current customer, never anyone else.",
    input_schema: {
        type: "object",
        properties: {},
    }
}

export async function getCustomerProfile(context: ToolContext): Promise<string>{
    const customer = await getCustomerById(
        context.customerId, 
        context.businessId
    );

    if(!customer){
        throw new NotFoundError("No customer profile found for this conversation.");
    }

    return JSON.stringify({
        first_name: customer.customer_name,
        last_name: customer.customer_lastname,
        phone_number: customer.phone_number
    })
}