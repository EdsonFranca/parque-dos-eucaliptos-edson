// Verificar variáveis de ambiente
console.log('Verificando variáveis de ambiente...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'NÃO DEFINIDA');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'NÃO DEFINIDA');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'NÃO DEFINIDA');

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Service Role Key (primeiros 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
}
