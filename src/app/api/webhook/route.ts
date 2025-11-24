import { NextResponse } from 'next/server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: Replace with your actual service account credentials in a secure way (e.g., environment variables)
// Do not hardcode credentials in your source code in a real production environment.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

function initializeFirebaseAdmin(): App {
  if (!getApps().length) {
    if (!serviceAccount) {
      throw new Error('Firebase service account credentials are not set.');
    }
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getApps()[0];
}

/**
 * Handles POST requests for the payment gateway webhook.
 * 
 * @param request The Next.js request object.
 * @returns A JSON response indicating success or failure.
 */
export async function POST(request: Request) {
  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    const data = await request.json();
    console.log('Webhook received:', JSON.stringify(data, null, 2));

    const { event, transaction } = data;
    
    // Check if the event is a successful payment
    if (event === 'transaction_status_changed' && transaction?.status === 'paid') {
      const userEmail = transaction.customer.email;
      const planId = transaction.payment.id; // Or however you identify the plan

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
      const subscriptionId = userDoc.data().subscriptionId;

      if (!subscriptionId) {
        console.error(`Webhook Error: subscriptionId not found for user ${userId}.`);
        return NextResponse.json({ message: 'Subscription ID missing for user' }, { status: 400 });
      }
      
      // 2. Update or Create Subscription
      const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);
      const now = new Date();
      let endDate;

      // This logic should match the purchased plan
      if (planId === 'monthly') { // This is a placeholder, adjust to your needs
         endDate = new Date(now.setMonth(now.getMonth() + 1));
      } else if (planId === 'quarterly') {
         endDate = new Date(now.setMonth(now.getMonth() + 3));
      } else {
         endDate = new Date(now.setMonth(now.getMonth() + 6));
      }

      await subscriptionRef.set({
        id: subscriptionId,
        userId: userId,
        status: 'active',
        planId: planId, // Store which plan was purchased
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
      }, { merge: true });

      console.log(`Successfully activated subscription ${subscriptionId} for user ${userId}.`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
