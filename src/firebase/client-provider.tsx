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
    // A verificação `typeof window !== 'undefined'` é uma segurança extra.
    // O useEffect com array de dependências vazio já garante a execução no cliente.
    if (typeof window !== 'undefined') {
      // Função para buscar a configuração do Firebase da nossa API route.
      const fetchFirebaseConfig = async () => {
        try {
          const res = await fetch('/api/firebase-config');
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Falha ao buscar a configuração do Firebase.');
          }
          const config: FirebaseOptions = await res.json();
          
          // Validação crucial: Garante que a API key exista antes de inicializar.
          if (!config.apiKey) {
            throw new Error('Chave de API do Firebase ausente na configuração recebida do servidor.');
          }
          
          // Inicializa o Firebase com a configuração recebida.
          setFirebaseServices(initializeFirebase(config));

        } catch (e: any) {
          console.error("Erro na inicialização do Firebase:", e.message);
          setError("Não foi possível inicializar o Firebase. Verifique as variáveis de ambiente no servidor e os logs.");
        }
      };

      fetchFirebaseConfig();
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
