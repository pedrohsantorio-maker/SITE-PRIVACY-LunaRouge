'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

// Helper function to initialize Firebase Admin on the server
function initializeFirebaseServer() {
    if (!getApps().length) {
        return initializeApp(firebaseConfig);
    }
    return getApps()[0];
}


const schema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
});


export async function loginAction(prevState: any, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { message: parsed.error.errors.map((e) => e.message).join(', ') };
  }
  
  try {
    const firebaseApp = initializeFirebaseServer();
    const auth = getAuth(firebaseApp);
    await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        return { message: 'Conta não encontrada. Por favor, crie uma conta.' };
    }
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        return { message: 'Credenciais inválidas. Verifique seu email e senha.' };
    }
    console.error('Login error:', error);
    return { message: 'Ocorreu um erro. Tente novamente.' };
  }

  redirect('/dashboard');
}
