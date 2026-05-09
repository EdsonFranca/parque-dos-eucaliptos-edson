import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  try {
    const body = await request.json()

    const classificadoData = {
      ...body,
      status: 'ativo',
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('classificados')
      .insert([classificadoData])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar classificado:', error)
      return NextResponse.json({ error: 'Erro ao criar', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, message: 'Classificado criado com sucesso!' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  try {
    const { id, novoStatus } = await request.json()

    if (!id || !novoStatus) {
      return NextResponse.json({ error: 'Faltam dados obrigatórios' }, { status: 400 })
    }

    // Se estiver inativando, apaga os chats também (arquitetura Cascata segura)
    if (novoStatus === 'inativo') {
      const { data: chats } = await supabaseAdmin.from('chats_classificados').select('id').eq('classificado_id', id);
      if (chats && chats.length > 0) {
        const chatIds = chats.map(c => c.id);
        await supabaseAdmin.from('mensagens_chats').delete().in('chat_id', chatIds);
        await supabaseAdmin.from('chats_classificados').delete().in('id', chatIds);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('classificados')
      .update({ status: novoStatus })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao editar classificado:', error)
      return NextResponse.json({ error: 'Erro ao editar', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, message: 'Classificado editado com sucesso!' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
