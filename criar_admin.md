# Como Criar um Usuário Administrador

## Opção 1: Via Dashboard do Supabase (Recomendado)

1. **Criar usuário no Authentication:**
   - Acesse o dashboard do Supabase
   - Vá para Authentication > Users
   - Clique em "Add user"
   - Insira o email e senha do administrador
   - Marque "Auto confirm user"
   - Copie o ID do usuário criado

2. **Executar script SQL:**
   - Vá para SQL Editor
   - Execute o script `database/criar_usuario_admin.sql`
   - Substitua `ID_DO_USUARIO_AUTH` pelo ID copiado

## Opção 2: Via API Endpoint

1. **Usar o endpoint criado:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/criar-usuario-admin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@parquedoseucaliptos.com",
       "password": "senha_segura_123",
       "nome": "Administrador Sistema",
       "chacara": "Administração"
     }'
   ```

2. **Pré-requisitos:**
   - Ter `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`
   - A aplicação deve estar rodando

## Verificação

Para verificar se o usuário foi criado corretamente:

```sql
SELECT * FROM perfis_moradores WHERE tipo_usuario = 'admin';
```

## Permissões

O usuário administrador terá:
- Acesso total à gestão de emails permitidos
- Permissão para gerenciar outros usuários (se implementado)
- Acesso a funcionalidades restritas do sistema

## Segurança

- Use senhas fortes para usuários admin
- Limite o número de usuários administradores
- Considere implementar autenticação de dois fatores
