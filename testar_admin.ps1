# Script PowerShell para testar criação de usuário admin
$body = @{
    email = "admin@parquedoseucaliptos.com"
    password = "senha123456"
    nome = "Administrador Sistema"
    chacara = "Administração"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/criar-usuario-admin" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Sucesso!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Erro:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody"
    }
}
