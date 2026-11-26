import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { getMessagesByConversationId } from "@/lib/services/messages.service";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ChatBox from "./chat-box";

export default async function ConversationPage(
    {params} : {params: Promise<{id:string}>}
) {
    const {id} = await params;
    const conversationId = Number(id);

    if(Number.isNaN(conversationId)){
        notFound();
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        redirect('/login');
    }

    let messages;
    try{
        messages = await getMessagesByConversationId(session.user.id, conversationId);
    } 
    catch(err){
        if(err instanceof AppError){
            notFound();
        }
        throw err;
    }

    return(
        <main className="flex-1">
            <div className="mx-auto max-w-3xl px-6 py-10">
                <h1 className="text-2xl font-semibold">
                    Conversation {conversationId}
                </h1>

                <ul className="mt-6 space-y-3">
                    {messages.map((message) => (
                        <li 
                            key={message.message_id}
                            className="rounded-md border border-zinc-800 p-3"
                        >
                            <p className="text-xs uppercase text-zinc-500">
                                {message.sender_type}
                            </p>
                            <p>
                                {message.message_text ?? '[An image or file was sent]'}
                            </p>
                        </li>
                    ))}
                </ul>

                <ChatBox conversationId={conversationId}/>
            </div>
        </main>
    )
}