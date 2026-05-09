'use client'

import React, { useState } from 'react'
import { servicoSchema, type ServicoFormData } from '../src/lib/schemas/servicoSchema'
import { Loader2, Save, X, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ServicoFormProps {
  perfil: any
  onSave: () => void
  onCancel: () => void
  initialData?: Partial<ServicoFormData>
}

export default function ServicoForm({ perfil, onSave, onCancel, initialData }: ServicoFormProps) {
  // Estados para carregamento e perfil
  const [carregandoPerfil, setCarregandoPerfil] = useState(true)
  const [perfilLocal, setPerfilLocal] = useState<any>(null)

  // Simplificar busca de perfil
  React.useEffect(() => {
    const buscarPerfil = async () => {
      console.log('Buscando perfil do usuário...')
      
      try {
        // Primeiro tentar usar o perfil passado como prop
        if (perfil && perfil.id) {
          console.log('Usando perfil passado como prop:', perfil)
          setPerfilLocal(perfil)
          setCarregandoPerfil(false)
          return
        }
        
        // Se não tiver perfil como prop, buscar da sessão atual
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log('Nenhum usuário encontrado na sessão')
          setCarregandoPerfil(false)
          return
        }
        
        console.log('Usuário encontrado:', user.id)
        
        // Buscar perfil na tabela perfis
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis')
          .select('id, nome, email')
          .eq('id', user.id)
          .single()
        
        if (perfilError) {
          console.log('Perfil não encontrado na tabela perfis, usando fallback')
          console.log('Erro:', perfilError)
          
          // Usar dados básicos do auth como fallback
          const perfilFallback = { 
            id: user.id, 
            nome: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            email: user.email,
            user_metadata: user.user_metadata
          }
          
          console.log('Perfil fallback criado:', perfilFallback)
          setPerfilLocal(perfilFallback)
        } else {
          console.log('Perfil encontrado:', perfilData)
          setPerfilLocal(perfilData)
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error)
      } finally {
        setCarregandoPerfil(false)
      }
    }
    
    buscarPerfil()
  }, [perfil])

  const [formData, setFormData] = useState<Partial<ServicoFormData>>({
    titulo: '',
    descricao: '',
    categoria: '',
    tipoServico: 'prestacao',
    valor: {
      valor: 0,
      tipo: 'fixo',
      negociavel: false,
      mostrarValor: true
    },
    disponibilidade: {
      imediato: true
    },
    localizacao: {
      tipo: 'remoto'
    },
    contato: {
      email: perfil?.email || '',
      telefone: '',
      preferenciaContato: 'qualquer'
    },
    status: 'ativo',
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)
  const [imagens, setImagens] = useState<string[]>([])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value
      }
    }))
  }

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setImagens(prev => [...prev, result])
    }
    reader.readAsDataURL(file)
  }

  const handleImageRemove = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    try {
      // Verificar se o perfil está carregado
      if (!perfilLocal || !perfilLocal.id) {
        alert('Perfil não carregado. Aguarde um momento e tente novamente.')
        return false
      }

      // Validar com Zod incluindo dados do perfil
      const dataToValidate = {
        ...formData,
        imagens: imagens.length > 0 ? imagens : undefined,
        prestador_id: perfilLocal.id,
        prestador_nome: perfilLocal.nome || 'Usuário'
      }
      console.log('Validando dados:', dataToValidate)
      servicoSchema.parse(dataToValidate)
      setErrors({})
      return true
    } catch (error: any) {
      console.error('Erro de validação:', error)
      if (error.issues) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue: any) => {
          const field = issue.path.join('.')
          fieldErrors[field] = issue.message
        })
        setErrors(fieldErrors)
        console.log('Erros de campo:', fieldErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== INÍCIO DO handleSubmit ===')
    
    // IMPORTANTE: Tentar buscar sessão, mas permitir fallback para perfilLocal armazenado
    let authUser = null;
    try {
      const { data } = await supabase.auth.getUser();
      authUser = data?.user;
    } catch (e) {
      console.log('Sessão supabase não encontrada, verificando fallback', e);
    }
    
    // Fallback: se não estiver autenticado pelo auth.getUser(), utilizar perfilLocal armazenado em cache/localStorage
    const prestadorId = authUser?.id || (perfilLocal && perfilLocal.id !== 'temp-id' ? perfilLocal.id : null);
    
    if (!prestadorId) {
      alert('Você precisa estar logado para criar um serviço');
      return;
    }
    
    const prestadorNome = perfilLocal?.nome || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Usuário';
    
    console.log('Prestador ID validado:', prestadorId);
    console.log('FormData:', formData);
    
    console.log('Setando salvando = true');
    setSalvando(true);
    
    try {
      const payload = {
        ...formData,
        prestador_id: prestadorId, // Usando auth.uid() para segurança RLS
        prestador_nome: prestadorNome,
        contato: {
          email: formData.contato?.email || authUser?.email || perfilLocal?.email || '',
          telefone: formData.contato?.telefone || '',
          whatsapp: formData.contato?.whatsapp || '',
          preferenciaContato: formData.contato?.preferenciaContato || 'email'
        },
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Payload montado:', payload)
      console.log('Enviando requisição para /api/servicos...')
      
      const response = await fetch('/api/servicos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      console.log('Resposta recebida:', response.status, response.statusText)
      
      if (!response.ok) {
        console.log('Resposta não OK, lendo erro...')
        const errorData = await response.json()
        console.error('Erro na resposta:', errorData)
        throw new Error(errorData.error || 'Erro ao criar serviço')
      }
      
      console.log('Resposta OK, lendo resultado...')
      const result = await response.json()
      console.log('Serviço criado:', result)
      
      alert('Serviço criado com sucesso!')
      onSave()
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
      alert('Erro ao criar serviço. Tente novamente.')
    } finally {
      console.log('Setando salvando = false')
      setSalvando(false)
      console.log('=== FIM DO handleSubmit ===')
    }
  }

  // Mostrar carregando enquanto espera o perfil
  if (carregandoPerfil) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Carregando perfil...</span>
      </div>
    )
  }

  // Mostrar aviso se perfil estiver incompleto
  if (perfilLocal && (!perfilLocal.nome || perfilLocal.nome === 'Usuário')) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-yellow-800">
          <h3 className="text-lg font-medium mb-2">Perfil Incompleto</h3>
          <p className="text-sm mb-4">
            Seu perfil básico está carregado, mas recomendamos completar seu cadastro para uma melhor experiência.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/membros/perfil'}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Completar Perfil
            </button>
            <button
              onClick={() => setPerfilLocal({...perfilLocal, nome: perfilLocal.email?.split('@')[0] || 'Usuário Temporário'})}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Continuar Mesmo Assim
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Se não tiver perfil local, criar um básico para não bloquear o formulário
  if (!perfilLocal) {
    const perfilBasico = {
      id: 'temp-id',
      nome: 'Usuário',
      email: 'email@exemplo.com'
    }
    setPerfilLocal(perfilBasico)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Título */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Título do Serviço *
          </label>
          <input
            type="text"
            value={formData.titulo || ''}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.titulo ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Serviços de Jardinagem"
          />
          {errors.titulo && (
            <p className="text-red-500 text-sm">{errors.titulo}</p>
          )}
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Categoria *
          </label>
          <input
            type="text"
            value={formData.categoria || ''}
            onChange={(e) => handleInputChange('categoria', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.categoria ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Jardinagem, Limpeza, etc."
          />
          {errors.categoria && (
            <p className="text-red-500 text-sm">{errors.categoria}</p>
          )}
        </div>

        {/* Tipo de Serviço */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Serviço *
          </label>
          <select
            value={formData.tipoServico || 'prestacao'}
            onChange={(e) => handleInputChange('tipoServico', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.tipoServico ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="prestacao">Prestação de Serviço</option>
            <option value="contratacao">Procurando Serviço</option>
          </select>
          {errors.tipoServico && (
            <p className="text-red-500 text-sm">{errors.tipoServico}</p>
          )}
        </div>

        {/* Valor */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.valor && formData.valor.valor !== undefined ? `R$ ${formData.valor.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
              onChange={(e) => {
                const numericString = e.target.value.replace(/\D/g, '');
                const numericValue = numericString ? parseFloat(numericString) / 100 : 0;
                handleNestedChange('valor', 'valor', numericValue);
              }}
              className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors['valor.valor'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="R$ 0,00"
            />
            <select
              value={formData.valor?.tipo || 'fixo'}
              onChange={(e) => handleNestedChange('valor', 'tipo', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fixo">Fixo</option>
              <option value="hora">Por hora</option>
              <option value="dia">Por dia</option>
              <option value="mes">Por mês</option>
              <option value="projeto">Por projeto</option>
            </select>
          </div>
          {errors['valor.valor'] && (
            <p className="text-red-500 text-sm">{errors['valor.valor']}</p>
          )}
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Descrição Detalhada *
        </label>
        <textarea
          value={formData.descricao || ''}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.descricao ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descreva detalhadamente o serviço oferecido, incluindo experiência, materiais, etc..."
        />
        {errors.descricao && (
          <p className="text-red-500 text-sm">{errors.descricao}</p>
        )}
        <p className="text-gray-500 text-sm">
          {formData.descricao?.length || 0}/3000 caracteres
        </p>
      </div>

      {/* Localização */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Localização *
        </label>
        <select
          value={formData.localizacao?.tipo || 'remoto'}
          onChange={(e) => handleNestedChange('localizacao', 'tipo', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors['localizacao.tipo'] ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="remoto">Remoto</option>
          <option value="presencial">Presencial</option>
          <option value="hibrido">Híbrido</option>
        </select>
        {errors['localizacao.tipo'] && (
          <p className="text-red-500 text-sm">{errors['localizacao.tipo']}</p>
        )}
      </div>

      {/* Contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email de Contato *
          </label>
          <input
            type="email"
            value={formData.contato?.email || ''}
            onChange={(e) => handleNestedChange('contato', 'email', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors['contato.email'] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="seu@email.com"
          />
          {errors['contato.email'] && (
            <p className="text-red-500 text-sm">{errors['contato.email']}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Telefone/WhatsApp *
          </label>
          <input
            type="tel"
            value={formData.contato?.telefone || ''}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 11) value = value.substring(0, 11);
              let formatted = value;
              if (value.length > 2) {
                formatted = `(${value.substring(0, 2)}) ` + value.substring(2);
              }
              if (value.length > 6) {
                if (value.length === 11) {
                  formatted = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
                } else {
                  formatted = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6)}`;
                }
              }
              handleNestedChange('contato', 'telefone', formatted);
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors['contato.telefone'] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(11) 98765-4321"
          />
          {errors['contato.telefone'] && (
            <p className="text-red-500 text-sm">{errors['contato.telefone']}</p>
          )}
        </div>
      </div>

      {/* Imagens */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imagens do Serviço (opcional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageAdd}
            className="hidden"
            id="imagens-servico"
          />
          <label
            htmlFor="imagens-servico"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Adicionar Imagens
          </label>
          <p className="text-gray-500 text-sm mt-2">
            Máximo 10 imagens. Formatos: JPG, PNG, GIF
          </p>
        </div>

        {imagens.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {imagens.map((imagem, index) => (
              <div key={index} className="relative group">
                <img
                  src={imagem}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          <X size={16} className="mr-2" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {salvando ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Publicar Serviço
            </>
          )}
        </button>
      </div>
    </form>
  )
}
