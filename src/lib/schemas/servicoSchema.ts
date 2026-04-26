import { z } from 'zod'

export const servicoSchema = z.object({
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
  
  tipoServico: z.enum(['prestacao', 'contratacao']),
  
  valor: z.object({
    valor: z.number()
      .min(0, 'Valor não pode ser negativo')
      .max(999999.99, 'Valor máximo é R$ 999.999,99'),
    tipo: z.enum(['fixo', 'hora', 'dia', 'mes', 'projeto']),
    negociavel: z.boolean().default(false),
    mostrarValor: z.boolean().default(true)
  }),
  
  disponibilidade: z.object({
    imediato: z.boolean(),
    dataInicio: z.string()
      .datetime('Data de início inválida')
      .optional(),
    dataFim: z.string()
      .datetime('Data de fim inválida')
      .optional(),
    horarios: z.array(z.object({
      diaSemana: z.enum(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']),
      horaInicio: z.string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
      horaFim: z.string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    })).optional()
  }),
  
  localizacao: z.object({
    tipo: z.enum(['remoto', 'presencial', 'hibrido']),
    endereco: z.object({
      rua: z.string()
        .min(5, 'Rua deve ter pelo menos 5 caracteres')
        .max(200, 'Rua não pode ter mais de 200 caracteres')
        .trim()
        .optional(),
      numero: z.string()
        .min(1, 'Número é obrigatório')
        .max(20, 'Número não pode ter mais de 20 caracteres')
        .trim()
        .optional(),
      bairro: z.string()
        .min(3, 'Bairro deve ter pelo menos 3 caracteres')
        .max(100, 'Bairro não pode ter mais de 100 caracteres')
        .trim()
        .optional(),
      cidade: z.string()
        .min(3, 'Cidade deve ter pelo menos 3 caracteres')
        .max(100, 'Cidade não pode ter mais de 100 caracteres')
        .trim()
        .optional(),
      estado: z.string()
        .length(2, 'Estado deve ter 2 caracteres')
        .trim()
        .toUpperCase()
        .optional(),
      cep: z.string()
        .min(8, 'CEP deve ter 8 caracteres')
        .max(9, 'CEP não pode ter mais de 9 caracteres')
        .trim()
        .regex(/^\d{8}$|^\d{5}-\d{3}$/, 'CEP inválido')
        .optional()
    }).optional(),
    raioAtendimento: z.number()
      .min(0, 'Raio de atendimento não pode ser negativo')
      .max(500, 'Raio máximo é 500km')
      .optional()
  }),
  
  habilidades: z.array(z.string()
    .min(2, 'Habilidade deve ter pelo menos 2 caracteres')
    .max(50, 'Habilidade não pode ter mais de 50 caracteres')
    .trim())
    .max(20, 'Máximo de 20 habilidades permitidas')
    .optional(),
  
  experiencia: z.string()
    .min(10, 'Descrição da experiência deve ter pelo menos 10 caracteres')
    .max(2000, 'Experiência não pode ter mais de 2.000 caracteres')
    .trim()
    .optional(),
  
  portfolio: z.array(z.object({
    titulo: z.string()
      .min(3, 'Título do portfolio deve ter pelo menos 3 caracteres')
      .max(100, 'Título não pode ter mais de 100 caracteres')
      .trim(),
    descricao: z.string()
      .min(10, 'Descrição deve ter pelo menos 10 caracteres')
      .max(500, 'Descrição não pode ter mais de 500 caracteres')
      .trim(),
    url: z.string()
      .url('URL inválida')
      .max(500, 'URL não pode ter mais de 500 caracteres')
      .trim()
      .optional(),
    imagem: z.string()
      .url('URL da imagem inválida')
      .max(500, 'URL não pode ter mais de 500 caracteres')
      .trim()
      .optional()
  })).max(10, 'Máximo de 10 itens no portfolio').optional(),
  
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
  
  imagens: z.array(z.string()
    .url('URL da imagem inválida')
    .max(500, 'URL não pode ter mais de 500 caracteres')
    .trim())
    .max(10, 'Máximo de 10 imagens permitidas')
    .optional(),
  
  videos: z.array(z.string()
    .url('URL do vídeo inválida')
    .max(500, 'URL não pode ter mais de 500 caracteres')
    .trim())
    .max(5, 'Máximo de 5 vídeos permitidos')
    .optional(),
  
  destaque: z.boolean().default(false),
  
  status: z.enum(['ativo', 'inativo', 'pausado']).default('ativo')
})

export const servicoAvaliacaoSchema = z.object({
  servicoId: z.string()
    .uuid('ID do serviço inválido'),
  
  nota: z.number()
    .min(1, 'Nota mínima é 1')
    .max(5, 'Nota máxima é 5'),
  
  comentario: z.string()
    .min(10, 'Comentário deve ter pelo menos 10 caracteres')
    .max(1000, 'Comentário não pode ter mais de 1.000 caracteres')
    .trim(),
  
  anonimo: z.boolean().default(false)
})

export type ServicoFormData = z.infer<typeof servicoSchema>
export type ServicoAvaliacaoFormData = z.infer<typeof servicoAvaliacaoSchema>
