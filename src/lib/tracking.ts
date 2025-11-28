'use client';
import { doc, updateDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore } from '@/firebase';

/**
 * Rastreia o clique de um usuário em um botão de assinatura.
 * Atualiza o documento do usuário no Firestore para marcar que o clique ocorreu.
 *
 * @param {Firestore} firestore - A instância do Firestore.
 * @param {string} userId - O ID do usuário que clicou no botão.
 */
export function trackSubscriptionClick(firestore: Firestore, userId: string) {
  if (!userId || !firestore) return;

  const userDocRef = doc(firestore, 'users', userId);

  // Operação não bloqueante para atualizar o documento.
  updateDoc(userDocRef, {
    hasClickedSubscription: true
  }).catch(error => {
    // Emite um erro contextualizado se a atualização falhar.
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'update',
      requestResourceData: { hasClickedSubscription: true },
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Falha ao rastrear clique de assinatura:", error);
  });
}
