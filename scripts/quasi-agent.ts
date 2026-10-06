/* import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main(){
    const rl = readline.createInterface({input, output});
    const description = await rl.question("What function do you want to create? ");
    rl.close();

    console.log("You asked for:", description);
}

main(); */

import Anthropic from "@anthropic-ai/sdk";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const client = new Anthropic();

const system =
  "You are an expert TypeScript developer. Write clean, well-typed code. " +
  "Do only what is asked in each step. " +
  "Respond with a single ```typescript code block and nothing else: no headings, no explanations.";

function getText(response: Anthropic.Message): string {
  const block = response.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "(no text)";
}

   function extractCode(text: string): string {
     const start = text.indexOf("```");
     const end = text.lastIndexOf("```");
     if (start === -1 || end === start) return text;
     const block = text.substring(start, end);
     return block.substring(block.indexOf("\n") + 1).trim();
   }

async function main() {
  const rl = readline.createInterface({ input, output });
  const description = await rl.question("What function do you want to create? ");
  rl.close();

  const conversation: Anthropic.MessageParam[] = [];

  // Round 1: write the function
  conversation.push({ 
    role: "user", 
    content: `Write a TypeScript function: ${description}` 
});

  const response1 = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 5000,
    system: system,
    messages: conversation,
  });
  const reply1 = getText(response1);
  const code1 = extractCode(reply1);
  conversation.push({ role: "assistant", content: "```typescript\n" + code1 + "\n```" });

    console.log("\n--- Round 1: the code ---\n");
    console.log(code1);

      // Round 2: add documentation
  conversation.push({
    role: "user",
    content:
      "Add comprehensive documentation to this function: a description, parameter descriptions, " +
      "the return value, example usage, and edge cases.",
  });

  const response2 = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 5000,
    system: system,
    messages: conversation,
  });
  const reply2 = getText(response2);
  const code2 = extractCode(reply2);
  conversation.push({ role: "assistant", content: "```typescript\n" + code2 + "\n```" });

  console.log("\n--- Round 2: with documentation ---\n");
  console.log(code2);

    // Round 3: add tests
  conversation.push({
    role: "user",
    content:
      "Add test cases using Vitest. Cover basic functionality, edge cases, error cases, " +
      "and various input scenarios. Keep it focused: about 15 tests in total. " +
      "Put the documented function and the tests together in the single code block.",
  });

  const response3 = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 5000,
    system: system,
    messages: conversation,
  });
  const reply3 = getText(response3);
  console.log("Round 3 stop_reason:", response3.stop_reason);
  
  conversation.push({ role: "assistant", content: reply3 });

  const code3 = extractCode(reply3);
  console.log("\n--- Round 3: with tests ---\n");
  console.log(code3);

}

main();