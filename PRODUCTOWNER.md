# 🌳 Parque dos Eucaliptos - Product & Development Guide

> **Diretrizes Oficiais (Product Owner)**
> Este documento serve como nosso Guia Definitivo, Backlog de Tarefas e Prompt de Sistema para todo o ciclo de desenvolvimento. O objetivo principal é manter o foco em **Custo Zero de infraestrutura** e escalabilidade.

---

## 🛠️ Stack Tecnológica ("Green Stack")

Tecnologias de ponta escolhidas para performance, gratuidade inicial e estética "Nature-First":

- **Frontend:** Next.js (React) com App Router para máxima velocidade e SEO.
- **Estilização:** Tailwind CSS (Primary: `#2D5A27`, Backgrounds terrosos/creme).
- **Backend & Auth:** Supabase (PostgreSQL + GoTrue) para gestão de usuários, banco de dados em tempo real e Storage de mídias.
- **Inteligência Artificial:** Vercel AI SDK integrado ao Google Gemini Flash (Motor RAG/Busca Semântica via `pgvector`).
- **Hospedagem:** Vercel para deploy contínuo global.

---

## 🚀 Épicos Principais (Core Features)

1. **Central de Transparência:** Feed de notícias com fotos e vídeos das melhorias realizadas no conjunto de chácaras.
2. **Área do Morador:** Espaço seguro para acesso a documentos, atas de assembleia e chat de trocas entre vizinhos.
3. **Zelador Digital (IA):** Chat inteligente treinado EXCLUSIVAMENTE no regulamento interno para respostas rápidas e precisas.
4. **Canal Direto:** Integração via API de WhatsApp para comunicação imediata com o Síndico.
5. **Painel Administrativo:** Gestão simplificada para a diretoria postar atualizações direto do celular.

---

## 📐 Arquitetura de Software

As regras de ouro da nossa base de código:
- **Domain-Driven Design (DDD) Adaptado:** Código organizado em módulos lógicos e independentes (Ex: `auth`, `feed`, `ia-zelador`).
- **Separação de Preocupações:** Componentes de UI separados da lógica de negócios e chamadas de banco de dados.
- **Manutenibilidade:** Código claro que permita acoplar novas funcionalidades no futuro sem gerar dívida técnica.

---

## 📋 Backlog e Plano de Ação (Kanban)

Aqui catalogaremos o progresso de cada tarefa. Marque com `[x]` ao finalizar.

### 0. Preparação
- [x] **Criar projeto no GitHub:** Repositório centralizado (main/develop) com `.gitignore` devidamente configurado para Next.js e chaves (Supabase/Google).

### 1. Fundação & Design
- [x] **Setup Next.js + Tailwind:** Ambiente padronizado. Fonte Serif/Sans, paleta de cores Nature-First. Instalação do `lucide-react`.
- [x] **Configuração Supabase:** Conexão com banco configurada. *(Pendente: Ajustar Bucket `benfeitorias-media` e habilitar Auth)*.

### 2. Área do Admin
- [ ] **Tela de Login Administrativa:** Rota `/admin/login` segura, com middleware de rotas baseado na role do Supabase.
- [ ] **Dashboard de Upload (Obras):** Publicação de mídias direto do celular com compressão e listagem com botão de excluir.
- [ ] **Painel de Avisos:** CRUD de avisos (`announcements`) com funcionalidade "Aviso Urgente" (Banner no topo).

### 3. Área do Membro
- [ ] **Auth e Perfil de Morador:** Login simplificado. Cadastro do "Número da Chácara" e RLS garantindo acesso privado.
- [ ] **Feed de Notícias:** Fetch de postagens por data com `Next/Image` e Skeleton Loaders.
- [ ] **Chat e Comentários:** Uso do Supabase Realtime para chat da vizinhança com filtro básico de palavras.

### 4. Zelador Digital (RAG)
- [ ] **Ingestão de PDF (Normas):** Script para extrair PDFs, fazer o chunking (Splitter), gerar os text-embeddings e salvar no `pgvector` do Supabase.
- [x] **Implementação RAG (IA):** Integração Vercel AI SDK com Gemini resolvida e rodando liso. (RPC configurada).
- [x] **Interface de Chat (UI):** Componente amigável, estado do chat responsivo.

### 5. Comunicação
- [ ] **Botão 'Fale com o Síndico':** Floating Action Button (z-index: 50) abrindo link dinâmico `wa.me` com template de mensagem.

### 6. Lançamento
- [ ] **Deploy na Vercel:** Conexão com repositório no GitHub, setup das variáveis de ambiente (`.env.local`) e SSL ativo na Vercel.
- [ ] **Teste de Homologação:** Rodar beta com 3 proprietários, aplicar correções de UX finais.

### 7. Qualidade
- [ ] **Setup de Testes:** Instalar e configurar Vitest + `@testing-library/react`. 
- [ ] **Testes Unitários:** Cobrir serviços essenciais (cálculos e filtros) dentro de `/src/modules` (80%+ coverage).

### 8. Segurança
- [ ] **Acesso a Dados (RLS):** Revisar as Policies do Postgres garantindo que membros isolados acessem apenas o permitido.
- [ ] **Sanitização de Inputs:** Validar todo e qualquer formulário com Zod impedindo ataques XSS ou corruptos via API Routes.
- [ ] **Auditoria Semanal:** Configurar Dependabot do Github para escanear dependências inseguras preventivamente.

---
*Proximo Foco Imediato de Acordo com PO: `[4. Zelador Digital - Ingestão de PDF (Normas)]`*
