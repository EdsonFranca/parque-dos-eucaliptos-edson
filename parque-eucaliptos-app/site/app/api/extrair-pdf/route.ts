import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let parser: { destroy: () => Promise<void>; getText: () => Promise<{ text: string }> } | null =
    null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // pdf-parse v2+ exporta a classe PDFParse (a API antiga `pdfParse(buffer)` foi removida).
    const { PDFParse } = require('pdf-parse') as typeof import('pdf-parse');
    parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const texto = textResult.text?.trim() ?? '';

    if (!texto) {
      return NextResponse.json(
        { error: 'O PDF está completamente vazio ou ilegível (apenas imagens, sem texto).' },
        { status: 400 }
      );
    }

    return NextResponse.json({ texto });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao processar o arquivo PDF.';
    console.error('Erro interno ao tentar processar o PDF vindo da memoria:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
}
