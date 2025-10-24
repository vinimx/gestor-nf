/**
 * Logger condicional - apenas em desenvolvimento
 * Evita exposição de informações sensíveis em produção
 */

const isDev = process.env.NODE_ENV === 'development';

// Controle de logs para evitar spam
const logCounts = new Map<string, number>();
const LOG_THROTTLE_MS = 5000; // 5 segundos

function shouldLog(key: string): boolean {
  if (!isDev) return false;
  
  const now = Date.now();
  const lastLog = logCounts.get(key) || 0;
  
  if (now - lastLog > LOG_THROTTLE_MS) {
    logCounts.set(key, now);
    return true;
  }
  
  return false;
}

export const logger = {
  /**
   * Log informativo - apenas em desenvolvimento
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log de aviso - sempre mostra
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log de erro - sempre mostra
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log de debug - apenas em desenvolvimento com throttling
   */
  debug: (key: string, ...args: any[]) => {
    if (shouldLog(key)) {
      console.log(...args);
    }
  },

  /**
   * Log de debug sem throttling (para logs únicos)
   */
  debugOnce: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log de grupo - apenas em desenvolvimento
   */
  group: (label: string, ...args: any[]) => {
    if (isDev) {
      console.group(label);
      console.log(...args);
      console.groupEnd();
    }
  },
};

