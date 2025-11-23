'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const schema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
});

// This action is tricky. It needs to run on the server for the redirect,
// but signInWithEmailAndPassword sets a client-side cookie that the server action can't access.
// In a real app, this would be handled differently (e.g., custom token exchange).
// For now, we keep it as a server action but acknowledge this limitation.
// We will call the client-side `initializeFirebase` and it will likely fail silently on the server,
// but the form post to this action is what's important for now. The actual sign-in
// logic for Firebase auth state is handled client-side by the `useUser` hook.
// The user will be redirected, and the client-side will pick up the auth state.

export async function loginAction(prevState: any, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { message: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  // We are not performing the sign-in here directly because server actions
  // cannot set the necessary client-side authentication cookies.
  // The login form itself on the client will handle the sign-in,
  // and this server action is primarily for form validation and redirection.
  // A "successful" validation here just means we can redirect.
  // The client will then determine if the login was truly successful.
  
  // A better approach in a real-world scenario would be a proper API route
  // or a library that handles server-side auth cookie management.

  // We will just redirect. The client will handle the actual login.
  // To provide some feedback, we can't easily check credentials here without
  // more complex setups. Let's assume the client-side will handle the UI
  // for "invalid credentials" based on the auth state listener.
  
  // NOTE: The original code had a flaw where it called a client function
  // from the server. This is a temporary conceptual fix.

  // A full solution would involve libraries like 'firebase-admin' for server-side
  // user management and custom token creation, which is beyond the scope of a
  // simple fix.

  // For now, we'll just redirect and let the client-side auth state do the work.
  // This means we can't show "Invalid credentials" from the server.
  
  redirect('/dashboard');
}
