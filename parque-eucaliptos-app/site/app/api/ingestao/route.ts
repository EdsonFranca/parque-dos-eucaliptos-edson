import { NextResponse } from 'next/server';

let pipelinePromise: Promise<any> | null = null;
let extractor: any;

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (!rawBody) {
      return NextResponse.json({ error: "O corpo da requisição está vazio ou ausente." }, { status: 400 });
    }
    const { texto } = JSON.parse(rawBody);

    // MOCK: Para testar se o Xenova está derrubando a máquina
    const mockEmbedding = Array.from({ length: 384 }, () => Math.random() * 0.1);

    return NextResponse.json({ embedding: mockEmbedding });
  } catch (error: any) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
