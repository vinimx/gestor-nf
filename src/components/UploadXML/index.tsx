'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { NFEParser } from '@/lib/nfeParser'

interface UploadXMLProps {
  empresaId: string
  onUpload: (file: File) => Promise<void>
  loading?: boolean
}

interface XMLPreview {
  chave: string | null
  numero: string | null
  valor: number | null
  valid: boolean
  error?: string
}

export default function UploadXML({ empresaId, onUpload, loading = false }: UploadXMLProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<XMLPreview | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const parser = new NFEParser()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validar tipo de arquivo
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setPreview({
        chave: null,
        numero: null,
        valor: null,
        valid: false,
        error: 'Apenas arquivos XML são aceitos'
      })
      return
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setPreview({
        chave: null,
        numero: null,
        valor: null,
        valid: false,
        error: 'Arquivo muito grande. Máximo permitido: 10MB'
      })
      return
    }

    setSelectedFile(file)

    try {
      // Ler conteúdo do arquivo
      const text = await file.text()
      
      // Validar se é um XML NFe válido
      if (!parser.validateNFeXml(text)) {
        setPreview({
          chave: null,
          numero: null,
          valor: null,
          valid: false,
          error: 'XML inválido ou não é uma NFe válida'
        })
        return
      }

      // Extrair informações básicas
      const basicInfo = parser.extractBasicInfo(text)
      
      setPreview({
        chave: basicInfo.chave,
        numero: basicInfo.numero,
        valor: basicInfo.valor,
        valid: true
      })
    } catch (error) {
      setPreview({
        chave: null,
        numero: null,
        valor: null,
        valid: false,
        error: 'Erro ao processar o arquivo XML'
      })
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !preview?.valid) return

    try {
      await onUpload(selectedFile)
      // Limpar estado após upload bem-sucedido
      setSelectedFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Erro no upload:', error)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {!selectedFile ? (
          <div className="space-y-4">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Arraste e solte seu arquivo XML aqui
              </p>
              <p className="text-sm text-gray-500">
                ou clique para selecionar
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Selecionar arquivo XML
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-700">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview das informações do XML */}
      {preview && (
        <div className={`p-4 rounded-lg border ${
          preview.valid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {preview.valid ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              {preview.valid ? (
                <div>
                  <h4 className="font-medium text-green-800 mb-2">
                    XML válido - Pronto para importar
                  </h4>
                  <div className="space-y-1 text-sm text-green-700">
                    {preview.chave && (
                      <p><strong>Chave de acesso:</strong> {preview.chave}</p>
                    )}
                    {preview.numero && (
                      <p><strong>Número:</strong> {preview.numero}</p>
                    )}
                    {preview.valor && (
                      <p><strong>Valor total:</strong> R$ {preview.valor.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-red-800 mb-1">
                    Erro no arquivo XML
                  </h4>
                  <p className="text-sm text-red-700">{preview.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botão de Upload */}
      {selectedFile && preview?.valid && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Importando...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Importar Nota Fiscal</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}




