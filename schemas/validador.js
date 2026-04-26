import { z } from 'zod';

export const anuncioSchema = z.object({
  titulo: z.string()
    .min(5, "O título deve ter pelo menos 5 caracteres")
    .max(100, "O título é muito longo")
    .trim(),
  descricao: z.string()
    .min(10, "Descreva melhor o que você está oferecendo")
    .max(500, "A descrição não pode passar de 500 caracteres"),
  preco: z.number().positive("O preço deve ser maior que zero"),
  // Sanitização básica: o .trim() remove espaços vazios inúteis
});
