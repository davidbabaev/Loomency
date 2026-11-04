// it would hold everything for this tool: the rule, the card, and the function

import { dayOfWeekEnum } from "@/lib/db/schema";
import { ToolCard } from "@/lib/llm/claude.client";
import z from "zod";

export const GetOpeningHoursSchema = z.object({
    day: z
        .enum(dayOfWeekEnum.enumValues)
        .describe("The day of the week in lowercase English, for example saturday"),
})

const {$schema, ...openingHoursInputSchema} = z.toJSONSchema(GetOpeningHoursSchema);

export const getOpeningHoursCard: ToolCard = {
    name: 'get_opening_hours',
    description: 
        "Retunrs this business's opening hours for one day of the week. " +
        "Use it whenever the customer asks when you are open, or whether you are open on a certain day." + 
        "If the customer says today or tomorrow, ask which day of the week they mean.", 
    input_schema: openingHoursInputSchema as ToolCard["input_schema"],
};