import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { servicoSchema } from '../../../src/lib/schemas/servicoSchema'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const busca = searchParams.get('busca')

    const supabaseQuery = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    let query = supabaseQuery
      .from('servicos')
      .select('*')
      .order('created_at', { ascending: false })

    if (busca) {
      const termoBusca = busca.trim()
      query = query.or(`
        titulo.ilike.%${termoBusca}%, 
        descricao.ilike.%${termoBusca}%, 
        prestador_nome.ilike.%${termoBusca}%
      `)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar serviços:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar serviços', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro inesperado ao buscar serviços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  try {
    const body = await request.json()

    // Mapeamento estrito, substituindo textos em branco por null para não engatilhar constraint de vazia, e evitar erro PGRST de colunas inexistentes (ex: categoria)
    const servicoData = {
      prestador_id: body.prestador_id || null,
      prestador_nome: body.prestador_nome || null,
      titulo: body.titulo || null,
      descricao: body.descricao || null,
      contato: typeof body.contato === 'object' ? JSON.stringify(body.contato) : (body.contato || null),
      foto_url: body.imagens?.[0] || body.foto_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop', // Imagem padrão limpa para serviços sem foto
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Dados mapeados para Supabase:', servicoData)

    // Inserir no Supabase usando admin client (bypassa RLS)
    const { data, error } = await supabaseAdmin
      .from('servicos')
      .insert([servicoData])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar serviço:', error)
      
      // Tratar erros específicos do Supabase
      if (error.code === 'PGRST205') {
        return NextResponse.json(
          { error: 'Tabela "servicos" não encontrada', code: 'TABLE_NOT_FOUND' },
          { status: 500 }
        )
      }
      
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Sem permissão para criar serviço', code: 'PERMISSION_DENIED' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao criar serviço', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data, message: 'Serviço criado com sucesso!' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao processar criação de serviço:', error)

    // Tratar erros de validação Zod
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.reduce((acc: Record<string, string>, err: any) => {
        const field = err.path.join('.')
        acc[field] = err.message
        return acc
      }, {})

      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          code: 'VALIDATION_ERROR',
          fieldErrors,
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
