'use client';

import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANTE: NÃO MODIFIQUE ESTA FUNÇÃO
// Esta função agora apenas inicializa o app e retorna os SDKs,
// a lógica de login foi movida para o provider.
export function initializeFirebase(config: FirebaseOptions) {
  if (getApps().length) {
    return getSdks(getApp());
  }

  const firebaseApp = initializeApp(config);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  return {
    firebaseApp,
    auth: auth,
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
