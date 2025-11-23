'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


const schema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  age: z.coerce.number().int().min(1, { message: 'Idade é obrigatória' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres' }),
});

// This action is tricky. It needs to run on the server for the redirect,
// but createUserWithEmailAndPassword sets a client-side cookie that the server action can't access.
// In a real app, this would be handled differently (e.g., custom token exchange).
// For now, we keep it as a server action but acknowledge this limitation.
// We will call the client-side `initializeFirebase` and it will likely fail silently on the server,
// but the form post to this action is what's important for now. The actual sign-in
// logic for Firebase auth state is handled client-side by the `useUser` hook.
// The user will be redirected, and the client-side will pick up the auth state.
export async function signupAction(prevState: any, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { message: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  // The client-side will handle the actual account creation and login.
  // This server action will just validate and redirect. The form on the
  // client will also call `createUserWithEmailAndPassword`. This is a
  // duplication of effort but necessary in this mixed environment to
  // ensure the redirect happens correctly from the server and the auth
  // state is correctly set on the client.
  
  redirect('/dashboard');
}
