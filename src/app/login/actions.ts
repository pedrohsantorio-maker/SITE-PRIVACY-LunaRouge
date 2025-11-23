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
    console.error("Erro ao realizar login:", error);
    let errorMessage = "Ocorreu um erro ao tentar fazer login. Tente novamente.";
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "Conta não encontrada. Por favor, verifique o e-mail ou crie uma conta.";
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = "A senha está incorreta. Tente novamente.";
        break;
      case 'auth/invalid-email':
        errorMessage = "O e-mail fornecido é inválido.";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Erro de conexão com a internet. Tente novamente mais tarde.";
        break;
      default:
        // Mantém a mensagem de erro genérica ou a mensagem do próprio erro para outros casos.
        errorMessage = error.message || errorMessage;
    }
    return { message: errorMessage };
  }

  redirect('/dashboard');
}
