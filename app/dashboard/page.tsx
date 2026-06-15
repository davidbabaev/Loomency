import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation';
import LogoutButton from './logout-button';

export default async function DashboardPage() {

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session){
        redirect('/login');
    }

  return (
    <main className='flex-1'>
        <div className='mx-auto max-w-5xl px-6 py-10'>
            <h1 className='text-2xl font-semibold'>Welcome, {session.user.name}</h1>
            <p className='mt-2 text-zinc-600 dark:text-zinc-400'>You are logged in</p>
            <div className='mt-6'>
                <LogoutButton/>
            </div>
        </div>
    </main>
  )
}
