// lib/ia.ts
// Esta é a única forma de isolar o ambiente para o Transformers.js no Next.js
export async function getExtractor() {
    // Vacina local antes da importação
    if (typeof window !== 'undefined') {
        (window as any).process = { env: {} };
    }

    const { pipeline, env } = await import('@xenova/transformers');

    env.allowLocalModels = false;
    env.useBrowserCache = true;

    return await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
}
