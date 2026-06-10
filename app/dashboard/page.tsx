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
    <div>
        <p>Welcome, {session.user.name} - you are logged in.</p>
        <LogoutButton/>
    </div>
  )
}
