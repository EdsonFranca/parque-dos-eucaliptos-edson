import { z } from 'zod'

export const postSchema = z.object({
  titulo: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres')
    .trim(),
  
  conteudo: z.string()
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
    .max(10000, 'Conteúdo não pode ter mais de 10.000 caracteres')
    .trim(),
  
  categoria: z.string()
    .min(3, 'Categoria deve ter pelo menos 3 caracteres')
    .max(50, 'Categoria não pode ter mais de 50 caracteres')
    .trim(),
  
  tags: z.array(z.string()
    .min(2, 'Tag deve ter pelo menos 2 caracteres')
    .max(30, 'Tag não pode ter mais de 30 caracteres')
    .trim())
    .max(10, 'Máximo de 10 tags permitidas')
    .optional(),
  
  imagem: z.string()
    .url('URL da imagem inválida')
    .max(500, 'URL da imagem não pode ter mais de 500 caracteres')
    .trim()
    .optional(),
  
  video: z.string()
    .url('URL do vídeo inválida')
    .max(500, 'URL do vídeo não pode ter mais de 500 caracteres')
    .trim()
    .optional(),
  
  visibilidade: z.enum(['publico', 'privado', 'amigos']),
  
  permitirComentarios: z.boolean().default(true),
  
  permitirCurtidas: z.boolean().default(true),
  
  dataPublicacao: z.string()
    .datetime('Data de publicação inválida')
    .optional(),
  
  localizacao: z.object({
    nome: z.string()
      .max(100, 'Nome do local não pode ter mais de 100 caracteres')
      .trim()
      .optional(),
    latitude: z.number()
      .min(-90, 'Latitude deve estar entre -90 e 90')
      .max(90, 'Latitude deve estar entre -90 e 90')
      .optional(),
    longitude: z.number()
      .min(-180, 'Longitude deve estar entre -180 e 180')
      .max(180, 'Longitude deve estar entre -180 e 180')
      .optional()
  }).optional(),
  
  mencionados: z.array(z.string()
    .email('Email de usuário mencionado inválido')
    .trim()
    .toLowerCase())
    .max(20, 'Máximo de 20 menções permitidas')
    .optional()
})

export const comentarioSchema = z.object({
  conteudo: z.string()
    .min(1, 'Comentário não pode estar vazio')
    .max(1000, 'Comentário não pode ter mais de 1.000 caracteres')
    .trim(),
  
  postId: z.string()
    .uuid('ID do post inválido'),
  
  respostaId: z.string()
    .uuid('ID do comentário pai inválido')
    .optional()
})

export const curtidaSchema = z.object({
  postId: z.string()
    .uuid('ID do post inválido'),
  
  tipo: z.enum(['curtir', 'descurtir'])
})

export type PostFormData = z.infer<typeof postSchema>
export type ComentarioFormData = z.infer<typeof comentarioSchema>
export type CurtidaFormData = z.infer<typeof curtidaSchema>
