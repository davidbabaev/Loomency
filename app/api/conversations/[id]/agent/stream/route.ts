// We’ll build it in 5 pieces, one per message:
// The encoder ← now
// The pipe (ReadableStream) and closing it
// Running the agent and pushing words into the pipe
// Handling errors
// Returning the pipe to the browser

import { runAgentForUser } from "@/lib/services/agent.service";


const encoder = new TextEncoder();

// const stream = new ReadableStream({
//     async start(controller){
//         try{
//             await runAgentForUser(userId, )
//         }
//     }
// })