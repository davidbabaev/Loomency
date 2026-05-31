export async function GET(request: Request){
    const {searchParams} = new URL(request.url); // parse the url
    const name = searchParams.get('name') ?? 'stranger'; // pull out ?name=...
    return Response.json({message: `Hello ${name}`});
}

export async function POST(request: Request){
    const body = await request.json();
    return Response.json({youSent: body});
}