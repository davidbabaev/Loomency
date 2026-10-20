import { getCustomerProfile } from "@/lib/agent/tools/get-customer-profile";

// Before connecting the tool to Claude, we check that it works on its own. It’s like testing a repository function before wiring up the route. If something breaks later, we’ll know the tool itself is fine.

async function main(){
    try{
        const result = await getCustomerProfile({businessId: 2, customerId: 2});
        // We build the context by hand, playing the server’s role, with the IDs of conversation 7.
        console.log("Tool result:", result);
    }
    catch(err){
        console.log("Error:", err instanceof Error ? err.message : err);
    }
}

main();