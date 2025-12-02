import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    if (!config.apiKey || !config.projectId) {
       console.error("Variáveis de ambiente do Firebase não estão definidas no servidor.");
       return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao processar a rota de configuração do Firebase:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
