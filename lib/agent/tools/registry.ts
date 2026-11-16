import { ToolCard } from "@/lib/llm/claude.client"
import { ToolContext } from "./tool-context";
import { getCustomerProfile, getCustomerProfileCard } from "./get-customer-profile";
import { getOpeningHours, getOpeningHoursCard } from "./get-opening-hours";

type Tool = {
    card: ToolCard;
    run: (input: unknown, context: ToolContext) => Promise<string>;
}

export const tools: Tool[] = [
    { //item 1: customer profile
        card: getCustomerProfileCard,
        run: (_input, context) => getCustomerProfile(context)
    }, 
    { //item 2: opening hours
        card: getOpeningHoursCard,
        // getOpeningHours is already a function with exactly the right shape, because we wrote it that way:
        // async function getOpeningHours(input: unknown, context: ToolContext): Promise<string>
        run: getOpeningHours, 
    }, 
];

export const toolCards = tools.map((tool) => tool.card);