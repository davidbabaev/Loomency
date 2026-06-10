"use client"

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation"


export default function LogoutButton() {

    const router = useRouter();

    async function handleLogout() {
        await authClient.signOut();
        router.push('/login')
    }

  return (
    <div>
        <button
        // type="submit"
        className="flex justify-center rounded-md bg-indigo-500 my-5 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        onClick={handleLogout}
        >
            Sign out
        </button>
    </div>
  )
}
