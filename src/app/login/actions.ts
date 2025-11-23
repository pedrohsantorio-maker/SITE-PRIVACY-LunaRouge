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

  const { auth } = initializeFirebase();

  try {
    await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
  } catch (error: any) {
     if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        return { message: 'Credenciais inválidas. Verifique seu email e senha.' };
    }
    console.error('Erro ao fazer login:', error);
    return { message: 'Erro ao fazer login. Tente novamente.' };
  }

  redirect('/dashboard');
}
