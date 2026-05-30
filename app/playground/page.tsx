import Counter from './Counter';
export const dynamic = 'force-dynamic';

async function getMessages(){
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  if(Math.random() < 0.3){
    throw new Error("Failed to fetch messages");
  }

  return [
    {id: 1, text: 'First message'},
    {id: 2, text: 'Second message'},
  ];
}

export default async function PlaygroundPage() {
  // throw new Error("Boom - forcing the error boudary to show")
  // await new Promise((resolve) => setTimeout(resolve, 2000))

  const message = await getMessages();

  return (
    <div style={{padding: 40}}>
        <h1>Playground</h1>
        <ul>
          {message.map((m) => (
            <li key={m.id}>{m.text}</li>
          ))}
        </ul>
        <Counter/>
    </div>
  )
}
