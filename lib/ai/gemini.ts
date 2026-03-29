import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Inicializa a instância do provedor do Google
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

// Essa instância é usada nas rotas de API para chamar modelos específicos,
// como google('gemini-3-flash') ou google('gemini-2.5-flash').
