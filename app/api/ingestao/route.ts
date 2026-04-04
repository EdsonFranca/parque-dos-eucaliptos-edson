import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { texto } = await req.json();

    // Importamos a IA apenas aqui dentro (no servidor)
    const { pipeline } = await import('@xenova/transformers');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const output = await extractor(texto, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    return NextResponse.json({ embedding });
  } catch (error: any) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
