// Schemas de autenticação
export {
  cadastroSchema,
  loginSchema,
  type CadastroFormData,
  type LoginFormData
} from './authSchema'

// Schemas de posts
export {
  postSchema,
  comentarioSchema,
  curtidaSchema,
  type PostFormData,
  type ComentarioFormData,
  type CurtidaFormData
} from './postSchema'

// Schemas de serviços
export {
  servicoSchema,
  servicoAvaliacaoSchema,
  type ServicoFormData,
  type ServicoAvaliacaoFormData
} from './servicoSchema'

// Schemas de compra e venda
export {
  produtoSchema,
  produtoAvaliacaoSchema,
  ofertaSchema,
  type ProdutoFormData,
  type ProdutoAvaliacaoFormData,
  type OfertaFormData
} from './compraVendaSchema'

// Schemas de formulários específicos do projeto
export {
  cadastroMoradorSchema,
  loginMoradorSchema,
  loginAdminSchema,
  recuperacaoSenhaAdminSchema,
  agendaEventoSchema,
  transparenciaFinanceiraSchema,
  classificadoSchema,
  classificadoFiltroSchema,
  chatMensagemSchema,
  verificarEmailSchema,
  type CadastroMoradorFormData,
  type LoginMoradorFormData,
  type LoginAdminFormData,
  type RecuperacaoSenhaAdminFormData,
  type AgendaEventoFormData,
  type TransparenciaFinanceiraFormData,
  type ClassificadoFormData,
  type ClassificadoFiltroFormData,
  type ChatMensagemFormData,
  type VerificarEmailFormData
} from './formsSchema'
