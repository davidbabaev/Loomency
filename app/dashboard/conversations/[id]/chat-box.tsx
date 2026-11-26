"use client"

import { useState } from "react"
import { sendTestMessage } from "./actions";

export default function ChatBox({conversationId} : {conversationId: number}){
    const [input, setInput] = useState("");
    const [reply, setReply] = useState("");
    const [error, setError] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    async function handleSend(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();

        setError("");
        setReply("");
        setIsRunning(true);

        const result = await sendTestMessage(conversationId, input);
        if(!result.ok){
            setError(result.error);
            setIsRunning(false);
            return;
        }

        setInput("");
        setIsRunning(true);
    }

    return (
        <div className="mt-8">
            {/* && means if exsit show.. */}
            {reply && (
                <div className="mb-4 rounded-md border border-indigo-800 p-3">
                    <p className="text-xs uppercase text-zinc-500">Agent</p>
                    <p className="whitespace-pre-wrap">{reply}</p>
                </div>
            )}

            {error && (
                <p className="mb-4 rounded-md border border-red-800 p-3 text-red-400">{error}</p>
            )}

            <form onSubmit={handleSend} className="flex gap-2" >
                <input 
                    className="flex-1 rounded-md border border-zinc-700 bg-transparent px-3 py-2"
                    placeholder="Type message as the customer.."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isRunning}
                />
                <button
                    className="rounded-md bg-indigo-500 px-4 py-2 font-semibold text-white disabled:opacity-50"
                    disabled={isRunning}
                    type="submit"
                >
                    {isRunning ? "Running..." : "Send"}
                </button>
            </form>

        </div>
    )

} 