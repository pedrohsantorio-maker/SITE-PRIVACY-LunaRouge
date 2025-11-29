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
 * APENAS no navegador.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // A verificação `typeof window !== 'undefined'` é uma segurança extra.
    // O useEffect com array de dependências vazio já garante a execução no cliente.
    if (typeof window !== 'undefined') {
      // Função para buscar a configuração do Firebase da nossa API route.
      const fetchFirebaseConfig = async () => {
        try {
          const res = await fetch('/api/firebase-config');
          if (!res.ok) {
            throw new Error('Failed to fetch Firebase config');
          }
          const config: FirebaseOptions = await res.json();
          
          if (!config.apiKey) {
            throw new Error('Firebase API Key is missing from config');
          }
          
          // Inicializa o Firebase com a configuração recebida.
          setFirebaseServices(initializeFirebase(config));

        } catch (e: any) {
          console.error("Firebase initialization error:", e.message);
          setError("Could not initialize Firebase. Please check the server logs and environment variables.");
        }
      };

      fetchFirebaseConfig();
    }
  }, []); // O array vazio garante que isso rode apenas uma vez, no cliente.

  // Mostra uma mensagem de erro se a inicialização falhar.
  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
  }
  
  // Enquanto os serviços do Firebase estão sendo inicializados, podemos mostrar um loader
  // ou simplesmente não renderizar nada para evitar erros.
  if (!firebaseServices) {
    // Você pode substituir isso por um componente de loading de tela cheia se preferir.
    return null; 
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
