'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';


const schema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  age: z.coerce.number().int().min(1, { message: 'Idade é obrigatória' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres' }),
});


export async function signupAction(prevState: any, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { message: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  try {
    const { auth } = initializeFirebase();
    await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { message: 'Este email já está cadastrado. Por favor, faça login.' };
    }
    console.error('Signup error:', error);
    return { message: 'Ocorreu um erro ao criar a conta. Tente novamente.' };
  }
  
  redirect('/dashboard');
}
