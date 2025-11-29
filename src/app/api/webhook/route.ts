'use server';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// A variável de ambiente é lida e analisada com segurança.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let adminApp: App;

/**
 * Inicializa a aplicação de administração do Firebase de forma segura.
 * Garante que a aplicação seja inicializada apenas uma vez.
 */
function initializeFirebaseAdmin(): App {
  // Retorna a app existente se já foi inicializada.
  if (getApps().some(app => app.name === 'firebase-admin-app')) {
    return getApps().find(app => app.name === 'firebase-admin-app')!;
  }
  
  // Lança um erro se as credenciais da conta de serviço não estiverem configuradas.
  if (!serviceAccount) {
    throw new Error('As credenciais da conta de serviço do Firebase não estão definidas nas variáveis de ambiente.');
  }

  // Inicializa a app com as credenciais.
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  }, 'firebase-admin-app');

  return adminApp;
}

/**
 * Handles POST requests for the payment gateway webhook.
 * 
 * @param request The Next.js request object.
 * @returns A JSON response indicating success or failure.
 */
export async function POST(request: Request) {
  try {
    const app = initializeFirebaseAdmin();
    const db = getFirestore(app);

    const data = await request.json();
    console.log('Webhook received:', JSON.stringify(data, null, 2));

    const { event, transaction } = data;
    
    // Check if the event is a successful payment
    if (event === 'transaction_status_changed' && transaction?.status === 'paid') {
      const userEmail = transaction.customer.email; // This might be null for anonymous users
      const customUserId = transaction.customer.id; // Assuming the payment gateway can pass back a custom ID

      let userId = customUserId;
      let userDoc;

      if (!userId && userEmail) {
         // Fallback to email if custom ID is not available
         const usersRef = db.collection('users');
         const userQuery = await usersRef.where('email', '==', userEmail).limit(1).get();
         if (!userQuery.empty) {
            userDoc = userQuery.docs[0];
            userId = userDoc.id;
         }
      } else if (userId) {
         userDoc = await db.collection('users').doc(userId).get();
      }
      

      if (!userDoc || !userDoc.exists) {
        console.error(`Webhook Error: User with ID ${userId} or email ${userEmail} not found.`);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      
      userId = userDoc.id; // Ensure userId is the doc id
      const userData = userDoc.data()!;
      const planName = transaction.items[0]?.name?.toLowerCase() || 'unknown'; // e.g., '1 mês', '3 meses'

      // Create a subscription document if one doesn't exist
      let subscriptionId = userData.subscriptionId;
      if (!subscriptionId || subscriptionId === 'null') {
          const subscriptionRef = db.collection('subscriptions').doc();
          subscriptionId = subscriptionRef.id;
          // Update the user doc with the new subscriptionId immediately
          await userDoc.ref.update({ subscriptionId: subscriptionId });
          console.log(`Created new subscription ID ${subscriptionId} for user ${userId}`);
      }
      
      // Determine subscription duration
      const now = new Date();
      let endDate = new Date(now);
      let planId: 'starter' | 'professional' | 'enterprise' = 'starter';

      if (planName.includes('1 mês')) {
         endDate.setMonth(now.getMonth() + 1);
         planId = 'starter';
      } else if (planName.includes('3 meses')) {
         endDate.setMonth(now.getMonth() + 3);
         planId = 'professional';
      } else if (planName.includes('6 meses')) {
         endDate.setMonth(now.getMonth() + 6);
         planId = 'enterprise';
      }

      // Update Subscription document
      const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);
      await subscriptionRef.set({
        id: subscriptionId,
        userId: userId,
        status: 'active',
        planId: planId,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      }, { merge: true });
      
      // Update User document with payment status and plan
      await userDoc.ref.update({
        status: 'paid',
        plan: planId,
        endDate: endDate.toISOString(),
      });

      console.log(`Successfully activated subscription ${subscriptionId} for user ${userId} with plan ${planId}.`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
