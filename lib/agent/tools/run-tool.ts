// What it does
// It takes Claude’s request (the tool’s name and id) plus the context, and:
// finds the matching function and runs it
// wraps the result in a tool_result block with the same id
// if anything fails, still returns a tool_result block, marked is_error: true, so the loop never crashes

import { ContentBlock } from "@/lib/llm/claude.client";
import { ToolContext } from "./tool-context";
import { getCustomerProfile } from "./get-customer-profile";
import { AppError } from "@/lib/errors";

export async function runTool(name: string, id: string, context: ToolContext ) :Promise<ContentBlock>{

    try{
        let result: string;

        if(name === "get_customer_profile"){
            result = await getCustomerProfile(context)
        } else{
            throw new AppError(`Unknown tool: ${name}`, 400)
        }

        return {type: "tool_result", tool_use_id: id, content: result};
    } 
    catch(err){
        console.log("Tool failed:", name, err);
        
        const message = err instanceof AppError ? err.message : "The tool failed unexpectedly"

        return {type: "tool_result", tool_use_id: id, content: message, is_error: true}
    }
}