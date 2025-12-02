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
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  useEffect(() => {
    // Busca a configuração do Firebase da nossa API route.
    fetch('/api/firebase-config')
      .then(response => {
        if (!response.ok) {
          throw new Error('Falha ao buscar a configuração do Firebase do servidor.');
        }
        return response.json();
      })
      .then((config: FirebaseOptions) => {
        // Validação crucial: Garante que a API key exista antes de inicializar.
        if (!config.apiKey || !config.projectId) {
          throw new Error('A configuração do Firebase recebida do servidor está incompleta. Verifique as variáveis de ambiente no ambiente de hospedagem.');
        }
        
        // Inicializa o Firebase com a configuração recebida.
        setFirebaseServices(initializeFirebase(config));
      })
      .catch((e: any) => {
        console.error("Erro na inicialização do Firebase:", e.message);
        setError("Não foi possível conectar aos nossos serviços. Por favor, tente novamente mais tarde.");
      })
      .finally(() => {
        setIsLoadingConfig(false);
      });
  }, []); // O array vazio garante que isso rode apenas uma vez, no cliente.

  // Mostra uma mensagem de erro em tela cheia se a inicialização falhar.
  if (error) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', textAlign: 'center', color: 'red', backgroundColor: '#111' }}>{error}</div>;
  }
  
  // Enquanto a configuração está sendo buscada ou os serviços estão sendo inicializados,
  // não renderizamos nada (ou um loader).
  if (isLoadingConfig || !firebaseServices) {
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
