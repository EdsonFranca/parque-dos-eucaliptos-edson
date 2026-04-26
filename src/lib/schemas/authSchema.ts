import { z } from 'zod'

export const cadastroSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim()
    .regex(/^[a-zA-Z\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email não pode ter mais de 255 caracteres')
    .trim()
    .toLowerCase(),
  
  senha: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha não pode ter mais de 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial'),
  
  confirmarSenha: z.string()
    .min(8, 'Confirmação de senha é obrigatória')
    .max(128, 'Confirmação de senha não pode ter mais de 128 caracteres'),
  
  telefone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 caracteres')
    .max(20, 'Telefone não pode ter mais de 20 caracteres')
    .trim()
    .regex(/^\+?[\d\s()-]+$/, 'Telefone deve conter apenas números e caracteres válidos'),
  
  cpf: z.string()
    .min(11, 'CPF deve ter 11 caracteres')
    .max(14, 'CPF não pode ter mais de 14 caracteres')
    .trim()
    .regex(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  
  dataNascimento: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD')
    .refine((data) => {
      const dataNasc = new Date(data)
      const hoje = new Date()
      const idade = hoje.getFullYear() - dataNasc.getFullYear()
      return idade >= 18 && idade <= 120
    }, 'Você deve ter entre 18 e 120 anos'),
  
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
  
  termos: z.boolean()
    .refine((val) => val === true, 'Você deve aceitar os termos de uso')
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'Senhas não coincidem',
  path: ['confirmarSenha']
})

export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email não pode ter mais de 255 caracteres')
    .trim()
    .toLowerCase(),
  
  senha: z.string()
    .min(1, 'Senha é obrigatória')
    .max(128, 'Senha não pode ter mais de 128 caracteres'),
  
  lembrar: z.boolean().optional()
})

export type CadastroFormData = z.infer<typeof cadastroSchema>
export type LoginFormData = z.infer<typeof loginSchema>
