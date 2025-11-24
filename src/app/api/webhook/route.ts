'use server';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: Replace with your actual service account credentials in a secure way (e.g., environment variables)
// Do not hardcode credentials in your source code in a real production environment.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let adminApp: App;

function initializeFirebaseAdmin(): App {
  if (adminApp) return adminApp;

  if (getApps().some(app => app.name === 'firebase-admin-app')) {
    adminApp = getApps().find(app => app.name === 'firebase-admin-app')!;
    return adminApp;
  }
  
  if (!serviceAccount) {
    throw new Error('Firebase service account credentials are not set in environment variables.');
  }

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
      const userEmail = transaction.customer.email;
      const planName = transaction.items[0]?.name?.toLowerCase() || 'unknown'; // e.g., '1 mês', '3 meses'

      if (!userEmail) {
        console.error('Webhook Error: Customer email not found in payload.');
        return NextResponse.json({ message: 'Customer email missing' }, { status: 400 });
      }

      // 1. Find user by email
      const usersRef = db.collection('users');
      const userQuery = await usersRef.where('email', '==', userEmail).limit(1).get();

      if (userQuery.empty) {
        console.error(`Webhook Error: User with email ${userEmail} not found.`);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const userDoc = userQuery.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data();
      const subscriptionId = userData.subscriptionId;

      if (!subscriptionId) {
        console.error(`Webhook Error: subscriptionId not found for user ${userId}.`);
        return NextResponse.json({ message: 'Subscription ID missing for user' }, { status: 400 });
      }
      
      // 2. Determine subscription duration
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

      // 3. Update Subscription document
      const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);
      await subscriptionRef.set({
        status: 'active',
        planId: planId,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      }, { merge: true });
      
      // 4. Update User document with payment status and plan
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
