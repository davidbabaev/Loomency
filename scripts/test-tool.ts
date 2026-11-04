// import { getCustomerProfile } from "@/lib/agent/tools/get-customer-profile";
import { GetOpeningHoursSchema } from "@/lib/agent/tools/get-opening-hours";
// import { runTool } from "@/lib/agent/tools/run-tool";

// Before connecting the tool to Claude, we check that it works on its own. It’s like testing a repository function before wiring up the route. If something breaks later, we’ll know the tool itself is fine.

async function main(){
    try{
        console.log(GetOpeningHoursSchema.safeParse({day: 'saturday'}).success);
        console.log(GetOpeningHoursSchema.safeParse({day: 'Saturday'}).success);
        console.log(GetOpeningHoursSchema.safeParse({day: 'tomorrow'}).success);
        console.log(GetOpeningHoursSchema.safeParse({}).success);
        
    }
    catch(err){
        console.log("Error:", err instanceof Error ? err.message : err);
    }
}

main();