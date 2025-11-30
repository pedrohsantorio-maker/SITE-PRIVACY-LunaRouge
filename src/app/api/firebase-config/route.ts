import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    apiKey: process.env.FB_AK,
    authDomain: process.env.FB_AD,
    projectId: process.env.FB_PID,
    storageBucket: process.env.FB_SB,
    messagingSenderId: process.env.FB_MSID,
    appId: process.env.FB_APPID,
  };

  // Validação para garantir que as variáveis de ambiente estão definidas no servidor
  if (!config.apiKey || !config.projectId) {
    console.error('Firebase server environment variables are not set.');
    return NextResponse.json({ error: 'Firebase configuration is missing on the server.' }, { status: 500 });
  }

  return NextResponse.json(config);
}
