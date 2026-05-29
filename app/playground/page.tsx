import Counter from './Counter';

export default async function PlaygroundPage() {

  await new Promise((resolve) => setTimeout(resolve, 2000))

  return (
    <div style={{padding: 40}}>
        <h1>Playground</h1>
        <Counter/>
    </div>
  )
}
