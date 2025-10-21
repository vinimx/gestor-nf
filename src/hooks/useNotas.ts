'use client'

import { useState, useEffect } from 'react'
import { NotaFiscal } from '@/types/models'

interface NotaFiscalQuery {
  empresa_id?: string
  data_inicio?: string
  data_fim?: string
  chave?: string
  tipo?: 'entrada' | 'saida'
  status?: 'importado' | 'pendente' | 'cancelado'
  page?: number
  limit?: number
}

interface NotaFiscalResponse {
  data: NotaFiscal[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

export function useNotas(query: NotaFiscalQuery = {}) {
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<NotaFiscalResponse['pagination'] | null>(null)

  const fetchNotas = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (query.empresa_id) params.append('empresa_id', query.empresa_id)
      if (query.data_inicio) params.append('data_inicio', query.data_inicio)
      if (query.data_fim) params.append('data_fim', query.data_fim)
      if (query.chave) params.append('chave', query.chave)
      if (query.tipo) params.append('tipo', query.tipo)
      if (query.status) params.append('status', query.status)
      if (query.page) params.append('page', query.page.toString())
      if (query.limit) params.append('limit', query.limit.toString())

      const response = await fetch(`/api/notas?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar notas fiscais')
      }

      const result: NotaFiscalResponse = await response.json()
      setNotas(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotas()
  }, [
    query.empresa_id, 
    query.data_inicio, 
    query.data_fim, 
    query.chave, 
    query.tipo, 
    query.status, 
    query.page, 
    query.limit
  ])

  const createNota = async (data: Omit<NotaFiscal, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar nota fiscal')
      }

      const newNota = await response.json()
      setNotas(prev => [newNota, ...prev])
      return newNota
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateNota = async (id: string, data: Partial<NotaFiscal>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar nota fiscal')
      }

      const updatedNota = await response.json()
      setNotas(prev => prev.map(nota => nota.id === id ? updatedNota : nota))
      return updatedNota
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteNota = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notas/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir nota fiscal')
      }

      setNotas(prev => prev.filter(nota => nota.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getNota = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notas/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar nota fiscal')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const importXML = async (xmlFile: File, empresaId: string) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('xml', xmlFile)
      formData.append('empresa_id', empresaId)

      const response = await fetch('/api/notas/import-xml', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao importar XML')
      }

      const result = await response.json()
      
      // Adicionar a nova nota à lista
      setNotas(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    notas,
    loading,
    error,
    pagination,
    fetchNotas,
    createNota,
    updateNota,
    deleteNota,
    getNota,
    importXML,
  }
}




