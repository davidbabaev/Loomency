// it would hold everything for this tool: the rule, the card, and the function

import { dayOfWeekEnum } from "@/lib/db/schema";
import { ToolCard } from "@/lib/llm/claude.client";
import z from "zod";
import { ToolContext } from "./tool-context";
import { AppError } from "@/lib/errors";
import { getBusinessHoursForDayRepo } from "@/lib/repositories/business-hours.repository";

export const GetOpeningHoursSchema = z.object({
    day: z
        .enum(dayOfWeekEnum.enumValues)
        .describe("The day of the week in lowercase English, for example saturday"),
})

const {$schema, ...openingHoursInputSchema} = z.toJSONSchema(GetOpeningHoursSchema);

export const getOpeningHoursCard: ToolCard = {
    name: 'get_opening_hours',
    description: 
        "Returns this business's opening hours for one day of the week. " +
        "Use it whenever the customer asks when you are open, or whether you are open on a certain day. " + 
        "If the customer says today or tomorrow, ask which day of the week they mean.", 
    input_schema: openingHoursInputSchema as ToolCard["input_schema"],
};

export async function getOpeningHours(input: unknown, context: ToolContext): Promise<string>{
    const parsed = GetOpeningHoursSchema.safeParse(input);

    if(!parsed.success){
        throw new AppError(
            "Invalid input: day must be a day of the week in lowercase English, for example saturday",
            400
        );
    }

    const day = parsed.data.day;

    const hours = await getBusinessHoursForDayRepo(context.businessId, day);

    if(!hours){
        return `No opening hours are saved for ${day}. Do not guess, and do not assume the business is closed.`
    }

    if(hours.closed_all_day){
        return `The business is closed all day on ${day}.`
    }

    return `On ${day} the business is open from ${hours.open_time} to ${hours.close_time}.`
}