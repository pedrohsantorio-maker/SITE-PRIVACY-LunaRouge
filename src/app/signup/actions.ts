'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';


const schema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  age: z.coerce.number().int().min(18, { message: 'Você precisa ter 18 anos ou mais.' }),
  email: z.string().email({ message: 'O e-mail fornecido é inválido.' }),
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
});


export async function signupAction(prevState: any, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    // Retorna a primeira mensagem de erro da validação do Zod
    return { message: parsed.error.errors[0].message };
  }

  try {
    const { auth } = initializeFirebase();
    // This function signs the user in automatically after creation
    await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);

  } catch (error: any) {
    // Log do erro completo no servidor para diagnóstico
    console.error('Erro ao criar conta:', error);

    let errorMessage = 'Ocorreu um erro ao criar a conta. Tente novamente.';
    
    // Verificando o erro e exibindo mensagens mais específicas
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Este e-mail já está em uso. Tente outro ou faça login.";
        break;
      case 'auth/invalid-email':
        errorMessage = "O e-mail fornecido é inválido.";
        break;
      case 'auth/weak-password':
        errorMessage = "A senha é muito fraca. Tente uma senha com pelo menos 8 caracteres.";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        break;
      default:
        // Para outros erros inesperados, usamos a mensagem do próprio erro se disponível
        errorMessage = error.message || errorMessage;
        break;
    }
    return { message: errorMessage };
  }
  
  // Apenas retorna uma mensagem vazia em caso de sucesso.
  // O redirecionamento é tratado no lado do cliente após salvar os dados no Firestore.
  return { message: '' };
}
