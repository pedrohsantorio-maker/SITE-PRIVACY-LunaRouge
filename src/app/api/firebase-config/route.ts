import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  // Validação para garantir que as variáveis de ambiente estão definidas no servidor
  if (!config.apiKey || !config.projectId) {
    console.error('Firebase server environment variables are not set.');
    return NextResponse.json({ error: 'Firebase configuration is missing on the server.' }, { status: 500 });
  }

  return NextResponse.json(config);
}
