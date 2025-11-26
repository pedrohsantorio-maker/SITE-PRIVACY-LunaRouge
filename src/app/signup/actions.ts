'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Helper function to initialize Firebase Admin on the server
function initializeFirebaseServer() {
    if (!getApps().length) {
        return initializeApp(firebaseConfig);
    }
    return getApps()[0];
}

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

  let userCredential;
  try {
    const firebaseApp = initializeFirebaseServer();
    const auth = getAuth(firebaseApp);
    // This function signs the user in automatically after creation
    userCredential = await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);

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

  // --- Save user data to Firestore ---
  try {
     const firebaseApp = initializeFirebaseServer();
     const firestore = getFirestore(firebaseApp);
     const user = userCredential.user;

     // Create a new subscription document for the user
     const subscriptionRef = doc(collection(firestore, 'subscriptions'));
     await setDoc(subscriptionRef, {
        id: subscriptionRef.id,
        userId: user.uid,
        status: 'inactive', // Default status
        planId: null,
        startDate: null,
        endDate: null
     });

     // Create the user document with the subscriptionId
     const userDocRef = doc(firestore, 'users', user.uid);
     await setDoc(userDocRef, {
        id: user.uid,
        name: parsed.data.name,
        email: parsed.data.email,
        age: parsed.data.age,
        subscriptionId: subscriptionRef.id, // Link user to their subscription
        status: 'not_paid', // Set initial status
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
     }, { merge: true });

  } catch (dbError: any) {
      console.error("Failed to save user data to Firestore", dbError);
      // Even if DB write fails, auth account was created.
      // You might want to handle this case, e.g., by queueing the DB write.
      return { message: "Sua conta foi criada, mas houve um erro ao salvar seus dados. Por favor, contate o suporte." };
  }
  
  redirect('/dashboard');
}
