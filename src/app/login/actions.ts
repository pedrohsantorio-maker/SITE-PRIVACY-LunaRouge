'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const schema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
});


export async function loginAction(prevState: any, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { message: parsed.error.errors.map((e) => e.message).join(', ') };
  }
  
  // This is tricky because server actions can't set client-side cookies
  // for auth. We perform the check here to validate credentials, but the
  // actual auth state will be set on the client by the `useUser` hook
  // after the client-side sign-in call.
  // This server action essentially validates and provides feedback.
  try {
    // We are NOT using firebase-admin here. We are using the client SDK
    // in a server component. This is not ideal but works for this scenario
    // as we just want to validate credentials before redirecting.
    const { auth } = initializeFirebase();
    // We don't await this on purpose. The client will pick up the state change.
    // We just want to initiate it. If it fails, the catch block will run.
     await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
        return { message: 'Conta não encontrada. Por favor, crie uma conta.' };
    }
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        return { message: 'Credenciais inválidas. Verifique seu email e senha.' };
    }
    // For other errors, you might want to log them or handle them differently
    console.error('Login error:', error);
    return { message: 'Ocorreu um erro. Tente novamente.' };
  }

  redirect('/dashboard');
}
