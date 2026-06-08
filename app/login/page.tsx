'use client'

import { authClient } from '@/lib/auth-client';
import React, { useState } from 'react'

export default function LoginPage() {

    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[message, setMessage] = useState('');

    async function handleLogin() {
        const {error} = await authClient.signIn.email({email, password})

        if(error){
            setMessage('Login failed: ' + error.message)
        } else{
            setMessage('Logged in! Now check /api/auth/get-session')
        }

    }


  return (
    <div>
        <h1>Log in</h1>
        <input 
            type="email" 
            placeholder='Email' 
            onChange={(e) => setEmail(e.target.value)}
        />
        <input 
            type="password" 
            placeholder='Password' 
            onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleLogin}>Log in</button>
        {message && <p>{message}</p>}
    </div>
  );
}
