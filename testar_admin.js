// Script simples para testar a criação de usuário admin
// Execute com: node testar_admin.js

const endpoint = 'http://localhost:3001/api/admin/criar-usuario-admin';

const dadosUsuario = {
  email: 'admin@parquedoseucaliptos.com',
  password: 'senha123456',
  nome: 'Administrador Sistema',
  chacara: 'Administração'
};

fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(dadosUsuario)
})
.then(response => response.json())
.then(data => {
  console.log('Resposta:', data);
  if (data.success) {
    console.log('Usuário admin criado com sucesso!');
    console.log('ID:', data.user.id);
    console.log('Email:', data.user.email);
  } else {
    console.log('Erro ao criar usuário:', data.error);
  }
})
.catch(error => {
  console.error('Erro na requisição:', error);
});
