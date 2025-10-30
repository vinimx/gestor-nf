import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface EmpresaFocusConfig {
  focus_nfe_token: string | null;
  focus_nfe_environment: 'homologacao' | 'producao';
  focus_nfe_ativo: boolean;
}

export async function getEmpresaFocusConfig(empresaId: string): Promise<EmpresaFocusConfig | null> {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('focus_nfe_token, focus_nfe_environment, focus_nfe_ativo')
      .eq('id', empresaId)
      .single();

    if (error) {
      console.error('Erro ao buscar configuração FOCUS NFE da empresa:', error);
      return null;
    }

    return {
      focus_nfe_token: data.focus_nfe_token,
      focus_nfe_environment: data.focus_nfe_environment || 'homologacao',
      focus_nfe_ativo: data.focus_nfe_ativo || false,
    };
  } catch (error) {
    console.error('Erro ao buscar configuração FOCUS NFE da empresa:', error);
    return null;
  }
}

export async function updateEmpresaFocusConfig(
  empresaId: string, 
  config: Partial<EmpresaFocusConfig>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('empresas')
      .update({
        focus_nfe_token: config.focus_nfe_token,
        focus_nfe_environment: config.focus_nfe_environment,
        focus_nfe_ativo: config.focus_nfe_ativo,
        focus_nfe_ultima_validacao: new Date().toISOString(),
        focus_nfe_erro_validacao: null,
      })
      .eq('id', empresaId);

    if (error) {
      console.error('Erro ao atualizar configuração FOCUS NFE da empresa:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar configuração FOCUS NFE da empresa:', error);
    return false;
  }
}
