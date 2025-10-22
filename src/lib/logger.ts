/**
 * Logger condicional - apenas em desenvolvimento
 * Evita exposição de informações sensíveis em produção
 */

const isDev = process.env.NODE_ENV === 'development';

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
   * Log de debug - apenas em desenvolvimento
   */
  debug: (...args: any[]) => {
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

