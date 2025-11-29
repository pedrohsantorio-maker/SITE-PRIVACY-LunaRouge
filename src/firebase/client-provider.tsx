'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider, type FirebaseServices } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Este é um componente de cliente que garante que a inicialização do Firebase
 * ocorra APENAS no navegador.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // A verificação `typeof window !== 'undefined'` é uma segurança extra.
    // O useEffect com array de dependências vazio já garante a execução no cliente.
    if (typeof window !== 'undefined') {
      setFirebaseServices(initializeFirebase());
    }
  }, []); // O array vazio garante que isso rode apenas uma vez, no cliente.

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
