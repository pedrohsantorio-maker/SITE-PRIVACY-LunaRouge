'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAdminAuth, getAdminFirestore } from '@/firebase/server';

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

  const auth = getAdminAuth();
  const firestore = getAdminFirestore();

  try {
    const userRecord = await auth.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        displayName: parsed.data.name,
    });
    
    await firestore.collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      name: parsed.data.name,
      email: parsed.data.email,
      age: parsed.data.age,
    });

  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
        return { message: 'Este email já está em uso.' };
    }
    console.error('Erro ao criar conta:', error);
    return { message: 'Erro ao criar a conta. Por favor, tente novamente.' };
  }
  
  redirect('/dashboard');
}
