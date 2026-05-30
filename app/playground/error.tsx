"use client"

import { useRouter } from "next/navigation";

export default function Error({
    error, 
    reset
}: {
    error: Error & {digest?:string}
    reset: () => void;
}) {
    const router = useRouter();

  return (
    <div style={{padding: 24}}>
        <p>Something broke in the playground 💥</p>
        <p style={{opacity: 0.7}}>{error.message}</p>
        <button onClick={() => {router.refresh(); reset()}} style={{marginTop: 12}}>
            Try again
        </button>
    </div>
  )
}
