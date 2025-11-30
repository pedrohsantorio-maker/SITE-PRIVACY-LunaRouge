'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider, type FirebaseServices } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { type FirebaseOptions } from 'firebase/app';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Este é um componente de cliente que busca a configuração do Firebase
 * de uma API route e, em seguida, inicializa os serviços do Firebase
 * APENAS no navegador. Ele atua como uma barreira, garantindo que
 * o resto do app só renderize quando o Firebase estiver pronto.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // As variáveis de ambiente públicas são injetadas pelo Next.js durante o build.
      const config: FirebaseOptions = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      // Validação crucial: Garante que a API key exista antes de inicializar.
      if (!config.apiKey || !config.projectId) {
        throw new Error('A configuração do Firebase (variáveis de ambiente NEXT_PUBLIC_...) não está definida. Verifique seu arquivo .env ou as configurações do ambiente de hospedagem.');
      }
      
      // Inicializa o Firebase com a configuração.
      setFirebaseServices(initializeFirebase(config));

    } catch (e: any) {
      console.error("Erro na inicialização do Firebase:", e.message);
      setError("Não foi possível inicializar o Firebase. Verifique as variáveis de ambiente no servidor e os logs do build.");
    }
  }, []); // O array vazio garante que isso rode apenas uma vez, no cliente.

  // Mostra uma mensagem de erro em tela cheia se a inicialização falhar.
  if (error) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', textAlign: 'center', color: 'red', backgroundColor: '#111' }}>{error}</div>;
  }
  
  // Enquanto os serviços do Firebase estão sendo inicializados, não renderizamos nada (ou um loader).
  // Isso impede que qualquer componente filho tente usar o Firebase prematuramente.
  if (!firebaseServices) {
    return null; // Ou seu componente de loading de tela cheia
  }

  // Uma vez que os serviços estão prontos, nós renderizamos o provedor principal
  // com as instâncias do Firebase.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
