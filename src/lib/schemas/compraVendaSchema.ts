import { z } from 'zod'

export const produtoSchema = z.object({
  titulo: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres')
    .trim(),
  
  descricao: z.string()
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(5000, 'Descrição não pode ter mais de 5.000 caracteres')
    .trim(),
  
  categoria: z.string()
    .min(3, 'Categoria deve ter pelo menos 3 caracteres')
    .max(50, 'Categoria não pode ter mais de 50 caracteres')
    .trim(),
  
  subcategoria: z.string()
    .min(3, 'Subcategoria deve ter pelo menos 3 caracteres')
    .max(50, 'Subcategoria não pode ter mais de 50 caracteres')
    .trim()
    .optional(),
  
  tipo: z.enum(['venda', 'troca', 'doacao']),
  
  condicao: z.enum(['novo', 'seminovo', 'usado', 'conservado', 'precisa_reparo']),
  
  valor: z.object({
    valor: z.number()
      .min(0, 'Valor não pode ser negativo')
      .max(999999.99, 'Valor máximo é R$ 999.999,99'),
    tipo: z.enum(['fixo', 'negociavel', 'melhor_oferta']),
    mostrarValor: z.boolean().default(true),
    aceitaTroca: z.boolean().default(false),
    valorMinimo: z.number()
      .min(0, 'Valor mínimo não pode ser negativo')
      .max(999999.99, 'Valor mínimo máximo é R$ 999.999,99')
      .optional()
  }),
  
  localizacao: z.object({
    endereco: z.object({
      rua: z.string()
        .min(5, 'Rua deve ter pelo menos 5 caracteres')
        .max(200, 'Rua não pode ter mais de 200 caracteres')
        .trim(),
      numero: z.string()
        .min(1, 'Número é obrigatório')
        .max(20, 'Número não pode ter mais de 20 caracteres')
        .trim(),
      complemento: z.string()
        .max(100, 'Complemento não pode ter mais de 100 caracteres')
        .trim()
        .optional(),
      bairro: z.string()
        .min(3, 'Bairro deve ter pelo menos 3 caracteres')
        .max(100, 'Bairro não pode ter mais de 100 caracteres')
        .trim(),
      cidade: z.string()
        .min(3, 'Cidade deve ter pelo menos 3 caracteres')
        .max(100, 'Cidade não pode ter mais de 100 caracteres')
        .trim(),
      estado: z.string()
        .length(2, 'Estado deve ter 2 caracteres')
        .trim()
        .toUpperCase(),
      cep: z.string()
        .min(8, 'CEP deve ter 8 caracteres')
        .max(9, 'CEP não pode ter mais de 9 caracteres')
        .trim()
        .regex(/^\d{8}$|^\d{5}-\d{3}$/, 'CEP inválido')
    }),
    latitude: z.number()
      .min(-90, 'Latitude deve estar entre -90 e 90')
      .max(90, 'Latitude deve estar entre -90 e 90')
      .optional(),
    longitude: z.number()
      .min(-180, 'Longitude deve estar entre -180 e 180')
      .max(180, 'Longitude deve estar entre -180 e 180')
      .optional(),
    raioEntrega: z.number()
      .min(0, 'Raio de entrega não pode ser negativo')
      .max(500, 'Raio máximo é 500km')
      .optional()
  }),
  
  imagens: z.array(z.string()
    .url('URL da imagem inválida')
    .max(500, 'URL não pode ter mais de 500 caracteres')
    .trim())
    .min(1, 'Pelo menos uma imagem é obrigatória')
    .max(15, 'Máximo de 15 imagens permitidas'),
  
  videos: z.array(z.string()
    .url('URL do vídeo inválida')
    .max(500, 'URL não pode ter mais de 500 caracteres')
    .trim())
    .max(5, 'Máximo de 5 vídeos permitidos')
    .optional(),
  
  especificacoes: z.record(z.string()
    .min(1, 'Especificação não pode estar vazia')
    .max(100, 'Especificação não pode ter mais de 100 caracteres')
    .trim(), z.string()
    .min(1, 'Valor da especificação não pode estar vazio')
    .max(200, 'Valor não pode ter mais de 200 caracteres')
    .trim())
    .optional(),
  
  marca: z.string()
    .min(2, 'Marca deve ter pelo menos 2 caracteres')
    .max(100, 'Marca não pode ter mais de 100 caracteres')
    .trim()
    .optional(),
  
  modelo: z.string()
    .min(2, 'Modelo deve ter pelo menos 2 caracteres')
    .max(100, 'Modelo não pode ter mais de 100 caracteres')
    .trim()
    .optional(),
  
  ano: z.number()
    .min(1900, 'Ano deve ser a partir de 1900')
    .max(new Date().getFullYear() + 1, 'Ano não pode ser no futuro distante')
    .optional(),
  
  cor: z.string()
    .min(2, 'Cor deve ter pelo menos 2 caracteres')
    .max(50, 'Cor não pode ter mais de 50 caracteres')
    .trim()
    .optional(),
  
  dimensao: z.object({
    altura: z.number()
      .min(0, 'Altura não pode ser negativa')
      .max(1000, 'Altura máxima é 1000cm')
      .optional(),
    largura: z.number()
      .min(0, 'Largura não pode ser negativa')
      .max(1000, 'Largura máxima é 1000cm')
      .optional(),
    profundidade: z.number()
      .min(0, 'Profundidade não pode ser negativa')
      .max(1000, 'Profundidade máxima é 1000cm')
      .optional(),
    peso: z.number()
      .min(0, 'Peso não pode ser negativo')
      .max(1000000, 'Peso máximo é 1.000.000g')
      .optional(),
    unidade: z.enum(['cm', 'm', 'kg', 'g']).default('cm')
  }).optional(),
  
  estoque: z.object({
    quantidade: z.number()
      .min(1, 'Quantidade em estoque deve ser pelo menos 1')
      .max(9999, 'Quantidade máxima é 9.999'),
    controlado: z.boolean().default(true)
  }).optional(),
  
  entrega: z.object({
    disponivel: z.boolean().default(true),
    tipos: z.array(z.enum(['correios', 'transportadora', 'retirada', 'motoboy']))
      .min(1, 'Pelo menos um tipo de entrega deve ser selecionado'),
    custo: z.enum(['gratis', 'comprador', 'vendedor']),
    prazo: z.string()
      .max(50, 'Prazo não pode ter mais de 50 caracteres')
      .trim()
      .optional()
  }),
  
  garantia: z.object({
    possui: z.boolean().default(false),
    tempo: z.string()
      .max(50, 'Tempo de garantia não pode ter mais de 50 caracteres')
      .trim()
      .optional(),
    tipo: z.enum(['fabrica', 'loja', 'terceiro'])
      .optional()
  }),
  
  contato: z.object({
    email: z.string()
      .email('Email inválido')
      .max(255, 'Email não pode ter mais de 255 caracteres')
      .trim()
      .toLowerCase(),
    telefone: z.string()
      .min(10, 'Telefone deve ter pelo menos 10 caracteres')
      .max(20, 'Telefone não pode ter mais de 20 caracteres')
      .trim()
      .regex(/^\+?[\d\s()-]+$/, 'Telefone deve conter apenas números e caracteres válidos'),
    whatsapp: z.string()
      .min(10, 'WhatsApp deve ter pelo menos 10 caracteres')
      .max(20, 'WhatsApp não pode ter mais de 20 caracteres')
      .trim()
      .regex(/^\+?[\d\s()-]+$/, 'WhatsApp deve conter apenas números e caracteres válidos')
      .optional(),
    preferenciaContato: z.enum(['email', 'telefone', 'whatsapp', 'qualquer'])
  }),
  
  tags: z.array(z.string()
    .min(2, 'Tag deve ter pelo menos 2 caracteres')
    .max(30, 'Tag não pode ter mais de 30 caracteres')
    .trim())
    .max(10, 'Máximo de 10 tags permitidas')
    .optional(),
  
  destaque: z.boolean().default(false),
  
  status: z.enum(['ativo', 'inativo', 'vendido', 'reservado']).default('ativo')
})

export const produtoAvaliacaoSchema = z.object({
  produtoId: z.string()
    .uuid('ID do produto inválido'),
  
  nota: z.number()
    .min(1, 'Nota mínima é 1')
    .max(5, 'Nota máxima é 5'),
  
  comentario: z.string()
    .min(10, 'Comentário deve ter pelo menos 10 caracteres')
    .max(1000, 'Comentário não pode ter mais de 1.000 caracteres')
    .trim(),
  
  anonimo: z.boolean().default(false)
})

export const ofertaSchema = z.object({
  produtoId: z.string()
    .uuid('ID do produto inválido'),
  
  valor: z.number()
    .min(0, 'Valor da oferta não pode ser negativo')
    .max(999999.99, 'Valor máximo da oferta é R$ 999.999,99'),
  
  mensagem: z.string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(500, 'Mensagem não pode ter mais de 500 caracteres')
    .trim(),
  
  tipoTroca: z.string()
    .max(200, 'Descrição da troca não pode ter mais de 200 caracteres')
    .trim()
    .optional(),
  
  contato: z.object({
    email: z.string()
      .email('Email inválido')
      .max(255, 'Email não pode ter mais de 255 caracteres')
      .trim()
      .toLowerCase(),
    telefone: z.string()
      .min(10, 'Telefone deve ter pelo menos 10 caracteres')
      .max(20, 'Telefone não pode ter mais de 20 caracteres')
      .trim()
      .regex(/^\+?[\d\s()-]+$/, 'Telefone deve conter apenas números e caracteres válidos')
  })
})

export type ProdutoFormData = z.infer<typeof produtoSchema>
export type ProdutoAvaliacaoFormData = z.infer<typeof produtoAvaliacaoSchema>
export type OfertaFormData = z.infer<typeof ofertaSchema>
