@echo off
echo Criando usuario admin...
curl -X POST http://localhost:3000/api/admin/criar-usuario-admin ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@parquedoseucaliptos.com\",\"password\":\"senha123456\",\"nome\":\"Administrador Sistema\",\"chacara\":\"Administração\"}"
pause
