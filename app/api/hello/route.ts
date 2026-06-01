import { z } from 'zod';

const MessageSchema = z.object({
    name: z.string(),
    mood: z.string(),
});

export async function GET(request: Request){
    const {searchParams} = new URL(request.url); // parse the url
    const name = searchParams.get('name'); // pull out ?name=...

    if(!name){
        return Response.json({error: 'Please provide a name'}, {status: 400});
    }

    return Response.json({message: `Hello ${name}`});
}

export async function POST(request: Request){
    const body = await request.json();
    return Response.json({youSent: body});
}