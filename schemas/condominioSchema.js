import { z } from 'zod';

// Schema base para evitar repetição (DRY - Don't Repeat Yourself)
const baseSchema = {
  titulo: z.string()
    .min(5, "Título muito curto")
    .max(80, "Título deve ter no máximo 80 caracteres")
    .trim(),
  descricao: z.string()
    .min(10, "A descrição precisa de pelo menos 10 caracteres")
    .max(600, "Descrição muito longa para evitar ataques de buffer")
    .trim(),
};

// Schema específico para COMPRA E VENDA
export const vendaSchema = z.object({
  ...baseSchema,
  preco: z.coerce.number() // Converte string do input para número com segurança
    .positive("O preço deve ser maior que zero")
    .max(1000000, "Valor acima do permitido"),
  categoria: z.enum(["moveis", "eletro", "outros", "veiculos"]),
});

// Schema específico para SERVIÇOS
export const servicoSchema = z.object({
  ...baseSchema,
  valor_hora: z.coerce.number()
    .positive("O valor deve ser positivo"),
  categoria: z.string().min(3, "Selecione uma categoria"),
  disponibilidade: z.string().max(100),
});
