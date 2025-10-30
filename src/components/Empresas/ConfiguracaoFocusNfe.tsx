"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, ExternalLink, Info, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ConfiguracaoFocusNfeProps {
  empresaId?: string;
  initialData?: {
    focus_nfe_token?: string | null;
    focus_nfe_environment?: 'homologacao' | 'producao';
    focus_nfe_ativo?: boolean;
    focus_nfe_ultima_validacao?: string | null;
    focus_nfe_erro_validacao?: string | null;
  };
  onSave?: (data: {
    focus_nfe_token: string;
    focus_nfe_environment: 'homologacao' | 'producao';
    focus_nfe_ativo: boolean;
  }) => Promise<void>;
  disabled?: boolean;
}

export function ConfiguracaoFocusNfe({
  empresaId,
  initialData,
  onSave,
  disabled = false
}: ConfiguracaoFocusNfeProps) {
  const [token, setToken] = useState(initialData?.focus_nfe_token || '');
  const [environment, setEnvironment] = useState<'homologacao' | 'producao'>(
    initialData?.focus_nfe_environment || 'homologacao'
  );
  const [ativo, setAtivo] = useState(initialData?.focus_nfe_ativo || false);
  
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    suggestion?: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Estados para interatividade do token
  const [showToken, setShowToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [tokenStrength, setTokenStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Função para calcular força do token
  const calculateTokenStrength = (token: string) => {
    if (token.length < 10) return 'weak';
    if (token.length < 20) return 'medium';
    return 'strong';
  };

  // Função para copiar token
  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar token:', error);
    }
  };

  // Função para alternar visibilidade do token
  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  // Atualizar força do token quando ele muda
  React.useEffect(() => {
    setTokenStrength(calculateTokenStrength(token));
  }, [token]);

  const handleValidateToken = async () => {
    if (!token.trim()) {
      setValidationResult({
        valid: false,
        message: 'Digite um token para validar'
      });
      return;
    }

    setValidating(true);
    setValidationResult(null);
    setSaveError(null);

    try {
      const response = await fetch('/api/empresas/validar-token-focus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          environment
        }),
      });

      const result = await response.json();

      if (result.success) {
        setValidationResult({
          valid: result.valid,
          message: result.message,
          suggestion: result.suggestion
        });
        
        // Se o token for válido, ativar automaticamente
        if (result.valid) {
          setAtivo(true);
        }
      } else {
        setValidationResult({
          valid: false,
          message: result.message || 'Erro na validação',
          suggestion: result.suggestion
        });
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: 'Erro ao conectar com o servidor'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    setSaveError(null);

    try {
      await onSave({
        focus_nfe_token: token.trim(),
        focus_nfe_environment: environment,
        focus_nfe_ativo: ativo
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (validating) {
      return (
        <Badge className="flex items-center gap-2 bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="font-medium">Validando Token...</span>
        </Badge>
      );
    }

    if (validationResult) {
      return (
        <Badge 
          className={`flex items-center gap-2 px-3 py-1 font-medium ${
            validationResult.valid 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-red-100 text-red-800 border-red-200'
          }`}
        >
          {validationResult.valid ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {validationResult.valid ? 'Token Válido' : 'Token Inválido'}
        </Badge>
      );
    }

    if (initialData?.focus_nfe_ultima_validacao) {
      return (
        <Badge className="flex items-center gap-2 bg-gray-100 text-gray-700 border-gray-200 px-3 py-1">
          <Info className="h-3 w-3" />
          <span className="text-xs">Última validação: {new Date(initialData.focus_nfe_ultima_validacao).toLocaleDateString()}</span>
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-100 text-gray-600 border-gray-200 px-3 py-1">
        <span className="font-medium">Não configurado</span>
      </Badge>
    );
  };

  return (
    <Card className="border-l-4 border-gradient-to-r from-green-500 to-blue-500 bg-gradient-to-br from-green-50 via-white to-blue-50 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-full">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold">Token Sefaz</div>
                <div className="text-sm font-normal opacity-90">WebService Sefaz</div>
              </div>
              {getStatusBadge()}
            </CardTitle>
            <CardDescription className="text-green-100 mt-2">
              Configure o token de acesso para integração com o WebService da Sefaz e emissão de notas fiscais eletrônicas
            </CardDescription>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open('https://app.focusnfe.com.br', '_blank')}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <ExternalLink className="h-4 w-4" />
            Painel Sefaz
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Token */}
        <div className="space-y-3">
          <Label htmlFor="focus-token" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Token de Acesso Sefaz
          </Label>
          <div className="space-y-3">
            {/* Campo de Token com Controles Interativos */}
            <div className="relative">
              <Input
                id="focus-token"
                type={showToken ? "text" : "password"}
                placeholder="Cole aqui seu token de acesso do WebService Sefaz"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={disabled}
                className="w-full pr-20 border-2 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-lg"
              />
              
              {/* Controles do Token */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Botão Copiar */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyToken}
                  disabled={!token.trim()}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  title="Copiar token"
                >
                  {tokenCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
                
                {/* Botão Mostrar/Ocultar */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleTokenVisibility}
                  disabled={!token.trim()}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title={showToken ? "Ocultar token" : "Mostrar token"}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Indicador de Força do Token */}
            {token && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Força do token:</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-2 w-6 rounded-full ${
                        level <= (tokenStrength === 'weak' ? 1 : tokenStrength === 'medium' ? 2 : 3)
                          ? tokenStrength === 'weak'
                            ? 'bg-red-400'
                            : tokenStrength === 'medium'
                            ? 'bg-yellow-400'
                            : 'bg-green-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-medium ${
                  tokenStrength === 'weak' ? 'text-red-600' :
                  tokenStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {tokenStrength === 'weak' ? 'Fraca' : tokenStrength === 'medium' ? 'Média' : 'Forte'}
                </span>
              </div>
            )}
            
            {/* Botão de Validação */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleValidateToken}
                disabled={disabled || validating || !token.trim()}
                className="px-6 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 min-w-[140px]"
              >
                {validating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Validar Token'
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Info className="h-3 w-3" />
            O token pode ser encontrado no painel do WebService Sefaz em "Configurações" → "API"
          </p>
        </div>

        {/* Ambiente */}
        <div className="space-y-3">
          <Label htmlFor="focus-environment" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Ambiente de Operação
          </Label>
          <Select
            value={environment}
            onValueChange={(value: 'homologacao' | 'producao') => setEnvironment(value)}
            disabled={disabled}
          >
            <SelectTrigger className="border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg bg-white hover:border-blue-400 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
              <SelectItem 
                value="homologacao" 
                className="flex items-center gap-3 hover:bg-yellow-50 focus:bg-yellow-50 cursor-pointer"
              >
                <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900">Homologação</div>
                  <div className="text-xs text-gray-500">Ambiente de Testes</div>
                </div>
              </SelectItem>
              <SelectItem 
                value="producao" 
                className="flex items-center gap-3 hover:bg-green-50 focus:bg-green-50 cursor-pointer"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900">Produção</div>
                  <div className="text-xs text-gray-500">Ambiente Real</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Use "Homologação" para testes e "Produção" para uso real
          </p>
        </div>

        {/* Status da Validação */}
        {validationResult && (
          <Alert className={cn(
            "border-2 rounded-lg",
            validationResult.valid 
              ? "border-green-300 bg-gradient-to-r from-green-50 to-green-100" 
              : "border-red-300 bg-gradient-to-r from-red-50 to-red-100"
          )}>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {validationResult.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <AlertDescription className={cn(
                  "font-medium",
                  validationResult.valid ? "text-green-800" : "text-red-800"
                )}>
                  {validationResult.message}
                </AlertDescription>
              </div>
              
              {/* Sugestão se disponível */}
              {validationResult.suggestion && (
                <div className="ml-8 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">💡 Sugestão:</p>
                      <p className="text-sm text-blue-700">{validationResult.suggestion}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Alert>
        )}

        {/* Erro de Validação Anterior */}
        {initialData?.focus_nfe_erro_validacao && (
          <Alert className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <AlertDescription className="text-red-800">
                <strong className="font-semibold">Erro na última validação:</strong> {initialData.focus_nfe_erro_validacao}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Ativação */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <Switch
              id="focus-ativo"
              checked={ativo}
              onCheckedChange={setAtivo}
              disabled={disabled || !validationResult?.valid}
              className="data-[state=checked]:bg-green-600"
            />
            <div className="flex-1">
              <Label htmlFor="focus-ativo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Ativar WebService Sefaz para esta empresa
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                A integração só será ativada após a validação bem-sucedida do token
              </p>
            </div>
          </div>
        </div>

        {/* Erro de Salvamento */}
        {saveError && (
          <Alert className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <AlertDescription className="text-red-800 font-medium">
                {saveError}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Botão Salvar */}
        {onSave && (
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={disabled || saving || !token.trim()}
              className="min-w-[160px] bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
