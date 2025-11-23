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

export async function signupAction(prevState: any, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { message: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const { auth, firestore } = initializeFirebase();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
    const user = userCredential.user;

    await setDoc(doc(firestore, 'users', user.uid), {
      id: user.uid,
      name: parsed.data.name,
      email: parsed.data.email,
      age: parsed.data.age,
    });

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
        return { message: 'Este email já está em uso.' };
    }
    console.error('Erro ao criar conta:', error);
    return { message: 'Erro ao criar a conta. Por favor, tente novamente.' };
  }
  
  redirect('/dashboard');
}
