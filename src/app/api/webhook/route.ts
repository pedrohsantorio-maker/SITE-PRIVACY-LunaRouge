import { NextResponse } from 'next/server';

/**
 * Lida com as requisições POST para o webhook da gateway de pagamento.
 * 
 * @param request O objeto de requisição da Next.js.
 * @returns Uma resposta JSON indicando o sucesso ou falha do processamento.
 */
export async function POST(request: Request) {
  try {
    // 1. Analisa os dados recebidos da gateway
    const data = await request.json();
    
    // 2. Log dos dados para depuração
    // Em um ambiente de produção, você pode querer usar um serviço de log mais robusto.
    console.log('Webhook recebido:', JSON.stringify(data, null, 2));

    // 3. TODO: Adicione sua lógica de negócio aqui
    // Por exemplo, verifique o tipo de evento e atualize o status da assinatura no banco de dados.
    // Ex: if (data.event === 'subscription.updated') { ... }

    // 4. Responda à gateway para confirmar o recebimento
    return NextResponse.json({ message: 'Webhook recebido com sucesso' }, { status: 200 });

  } catch (error: any) {
    // Em caso de erro (ex: JSON inválido), retorne uma resposta de erro.
    console.error('Erro ao processar o webhook:', error);
    return NextResponse.json({ message: 'Erro no servidor interno', error: error.message }, { status: 500 });
  }
}
