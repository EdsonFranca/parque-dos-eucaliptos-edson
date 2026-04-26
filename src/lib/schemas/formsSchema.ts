import { z } from 'zod'

// Schema para formulário de cadastro de morador (versão simplificada)
export const cadastroMoradorSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim(),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email não pode ter mais de 255 caracteres')
    .trim()
    .toLowerCase(),
  
  chacara: z.string()
    .min(1, 'Chácara é obrigatória')
    .max(20, 'Chácara não pode ter mais de 20 caracteres')
    .trim()
    .regex(/^[a-zA-Z0-9\s]+$/, 'Chácara deve conter apenas letras, números e espaços'),
  
  senha: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(128, 'Senha não pode ter mais de 128 caracteres'),
  
  confirmarSenha: z.string()
    .min(6, 'Confirmação de senha é obrigatória')
    .max(128, 'Confirmação de senha não pode ter mais de 128 caracteres')
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'Senhas não coincidem',
  path: ['confirmarSenha']
})

// Schema para login de morador
export const loginMoradorSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email não pode ter mais de 255 caracteres')
    .trim()
    .toLowerCase(),
  
  senha: z.string()
    .min(1, 'Senha é obrigatória')
    .max(128, 'Senha não pode ter mais de 128 caracteres')
})

// Schema para login admin
export const loginAdminSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email não pode ter mais de 255 caracteres')
    .trim()
    .toLowerCase(),
  
  senha: z.string()
    .min(1, 'Senha é obrigatória')
    .max(128, 'Senha não pode ter mais de 128 caracteres')
})

// Schema para recuperação de senha admin
export const recuperacaoSenhaAdminSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email não pode ter mais de 255 caracteres')
    .trim()
    .toLowerCase(),
  
  novaSenha: z.string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(128, 'Nova senha não pode ter mais de 128 caracteres'),
  
  confirmarNovaSenha: z.string()
    .min(6, 'Confirmação de nova senha é obrigatória')
    .max(128, 'Confirmação de nova senha não pode ter mais de 128 caracteres')
}).refine((data) => data.novaSenha === data.confirmarNovaSenha, {
  message: 'Senhas não coincidem',
  path: ['confirmarNovaSenha']
})

// Schema para eventos da agenda
export const agendaEventoSchema = z.object({
  titulo: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres')
    .trim(),
  
  descricao: z.string()
    .max(1000, 'Descrição não pode ter mais de 1.000 caracteres')
    .trim()
    .optional(),
  
  dataEvento: z.string()
    .min(1, 'Data do evento é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  
  local: z.string()
    .max(100, 'Local não pode ter mais de 100 caracteres')
    .trim()
    .optional()
})

// Schema para transparência financeira
export const transparenciaFinanceiraSchema = z.object({
  titulo: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres')
    .trim(),
  
  descricao: z.string()
    .max(1000, 'Descrição não pode ter mais de 1.000 caracteres')
    .trim()
    .optional(),
  
  tipo: z.enum(['saldo', 'conta_pagar', 'despesa_diaria', 'despesa_mensal', 'despesa_pontual']),
  
  valor: z.string()
    .min(1, 'Valor é obrigatório')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Valor deve ser um número válido')
    .transform((val) => parseFloat(val.replace(',', '.')))
    .refine((val) => !isNaN(val), 'Valor deve ser um número válido')
    .refine((val) => val >= 0, 'Valor não pode ser negativo')
    .refine((val) => val <= 999999.99, 'Valor máximo é R$ 999.999,99'),
  
  mes: z.string()
    .min(1, 'Mês é obrigatório')
    .regex(/^(0?[1-9]|1[0-2])$/, 'Mês deve estar entre 1 e 12')
    .transform((val) => parseInt(val)),
  
  ano: z.string()
    .min(4, 'Ano deve ter 4 dígitos')
    .max(4, 'Ano deve ter 4 dígitos')
    .regex(/^\d{4}$/, 'Ano deve conter apenas números')
    .transform((val) => parseInt(val))
    .refine((val) => val >= 2020 && val <= new Date().getFullYear() + 1, 'Ano inválido')
})

// Schema para classificados (anúncios)
export const classificadoSchema = z.object({
  titulo: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres')
    .trim(),
  
  descricao: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição não pode ter mais de 2.000 caracteres')
    .trim(),
  
  preco: z.string()
    .min(1, 'Preço é obrigatório')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Preço deve ser um número válido')
    .transform((val) => parseFloat(val.replace(',', '.')))
    .refine((val) => !isNaN(val), 'Preço deve ser um número válido')
    .refine((val) => val >= 0, 'Preço não pode ser negativo')
    .refine((val) => val <= 999999.99, 'Preço máximo é R$ 999.999,99'),
  
  imagem: z.string()
    .min(1, 'Imagem é obrigatória')
    .url('URL da imagem inválida')
    .max(1000000, 'Imagem muito grande')
    .optional()
})

// Schema para filtros de classificados
export const classificadoFiltroSchema = z.object({
  busca: z.string()
    .max(200, 'Busca não pode ter mais de 200 caracteres')
    .trim()
    .optional(),
  
  precoMin: z.string()
    .regex(/^\d*([.,]\d{0,2})?$/, 'Preço mínimo inválido')
    .transform((val) => val ? parseFloat(val.replace(',', '.')) : null)
    .refine((val) => val === null || (!isNaN(val) && val >= 0), 'Preço mínimo deve ser positivo')
    .optional(),
  
  precoMax: z.string()
    .regex(/^\d*([.,]\d{0,2})?$/, 'Preço máximo inválido')
    .transform((val) => val ? parseFloat(val.replace(',', '.')) : null)
    .refine((val) => val === null || (!isNaN(val) && val >= 0), 'Preço máximo deve ser positivo')
    .optional()
}).refine((data) => {
  return data.precoMin === null || data.precoMax === null || data.precoMin <= data.precoMax;
}, {
  message: 'Preço mínimo deve ser menor ou igual ao preço máximo',
  path: ['precoMax']
})

// Schema para mensagens de chat
export const chatMensagemSchema = z.object({
  conteudo: z.string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(500, 'Mensagem não pode ter mais de 500 caracteres')
    .trim()
})

// Schema para verificação de email
export const verificarEmailSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email não pode ter mais de 255 caracteres')
    .trim()
    .toLowerCase()
})

export type CadastroMoradorFormData = z.infer<typeof cadastroMoradorSchema>
export type LoginMoradorFormData = z.infer<typeof loginMoradorSchema>
export type LoginAdminFormData = z.infer<typeof loginAdminSchema>
export type RecuperacaoSenhaAdminFormData = z.infer<typeof recuperacaoSenhaAdminSchema>
export type AgendaEventoFormData = z.infer<typeof agendaEventoSchema>
export type TransparenciaFinanceiraFormData = z.infer<typeof transparenciaFinanceiraSchema>
export type ClassificadoFormData = z.infer<typeof classificadoSchema>
export type ClassificadoFiltroFormData = z.infer<typeof classificadoFiltroSchema>
export type ChatMensagemFormData = z.infer<typeof chatMensagemSchema>
export type VerificarEmailFormData = z.infer<typeof verificarEmailSchema>
