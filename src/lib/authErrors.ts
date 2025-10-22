/**
 * Traduções de erros do Supabase Auth para mensagens amigáveis em português
 */
export const authErrorMessages: Record<string, string> = {
  // Erros de autenticação do Supabase
  'Invalid login credentials': 'Email ou senha incorretos',
  'Email not confirmed': 'Por favor, confirme seu email antes de fazer login',
  'User already registered': 'Este email já está cadastrado',
  'Password should be at least 6 characters':
    'A senha deve ter pelo menos 6 caracteres',
  'Unable to validate email address: invalid format': 'Formato de email inválido',
  'Password too weak':
    'Senha muito fraca. Use pelo menos 8 caracteres, uma letra maiúscula e um número',
  'Signup disabled': 'Cadastro de novos usuários está desabilitado',
  'Email rate limit exceeded':
    'Muitas tentativas. Aguarde alguns minutos e tente novamente',
  'Invalid token': 'Link inválido ou expirado',
  'Token has expired': 'Este link expirou. Solicite um novo',
  'User not found': 'Usuário não encontrado',
  'Auth session missing!': 'Sessão expirada. Faça login novamente',

  // Erros de rede
  'Network request failed': 'Erro de conexão. Verifique sua internet',
  'Failed to fetch': 'Erro de conexão. Verifique sua internet',
  'Authentication session missing': 'Sessão expirada. Faça login novamente',

  // Erros de validação customizados
  'Email is required': 'Email é obrigatório',
  'Password is required': 'Senha é obrigatória',
  'Passwords do not match': 'As senhas não coincidem',
  'Name is required': 'Nome é obrigatório',

  // Padrão
  default: 'Ocorreu um erro. Tente novamente',
};

/**
 * Traduz mensagem de erro do Supabase para português
 */
export function translateAuthError(error: string | Error): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Busca tradução exata
  if (authErrorMessages[errorMessage]) {
    return authErrorMessages[errorMessage];
  }

  // Busca por palavras-chave
  const lowerError = errorMessage.toLowerCase();
  
  if (lowerError.includes('email')) {
    if (lowerError.includes('invalid') || lowerError.includes('format')) {
      return authErrorMessages['Unable to validate email address: invalid format'];
    }
    if (lowerError.includes('confirmed')) {
      return authErrorMessages['Email not confirmed'];
    }
    if (lowerError.includes('already') || lowerError.includes('registered')) {
      return authErrorMessages['User already registered'];
    }
  }

  if (lowerError.includes('password')) {
    if (lowerError.includes('weak')) {
      return authErrorMessages['Password too weak'];
    }
    if (lowerError.includes('characters')) {
      return authErrorMessages['Password should be at least 6 characters'];
    }
    if (lowerError.includes('match')) {
      return authErrorMessages['Passwords do not match'];
    }
  }

  if (lowerError.includes('token') && lowerError.includes('expired')) {
    return authErrorMessages['Token has expired'];
  }

  if (lowerError.includes('token') && lowerError.includes('invalid')) {
    return authErrorMessages['Invalid token'];
  }

  if (lowerError.includes('network') || lowerError.includes('fetch')) {
    return authErrorMessages['Network request failed'];
  }

  if (lowerError.includes('session')) {
    return authErrorMessages['Auth session missing!'];
  }

  // Retorna mensagem padrão se não encontrar tradução
  return authErrorMessages.default;
}

/**
 * Formata erro para exibição
 */
export function formatAuthError(error: unknown): string {
  if (!error) {
    return authErrorMessages.default;
  }

  if (typeof error === 'string') {
    return translateAuthError(error);
  }

  if (error instanceof Error) {
    return translateAuthError(error.message);
  }

  if (typeof error === 'object' && 'message' in error) {
    return translateAuthError((error as { message: string }).message);
  }

  return authErrorMessages.default;
}

