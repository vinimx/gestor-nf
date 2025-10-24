// Máscaras para campos de cliente

export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function maskCPFCNPJ(value: string, tipo: 'FISICA' | 'JURIDICA'): string {
  if (tipo === 'FISICA') {
    return maskCPF(value);
  } else {
    return maskCNPJ(value);
  }
}

export function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

export function maskInscricaoEstadual(value: string): string {
  // Remove caracteres não numéricos e limita a 14 caracteres
  return value.replace(/\D/g, '').slice(0, 14);
}

// Funções para remover máscaras
export function removeMaskCPF(value: string): string {
  return value.replace(/\D/g, '');
}

export function removeMaskCNPJ(value: string): string {
  return value.replace(/\D/g, '');
}

export function removeMaskTelefone(value: string): string {
  return value.replace(/\D/g, '');
}

export function removeMaskCEP(value: string): string {
  return value.replace(/\D/g, '');
}

// Função para detectar tipo baseado no CPF/CNPJ
export function detectarTipoCPFCNPJ(value: string): 'FISICA' | 'JURIDICA' {
  const digits = value.replace(/\D/g, '');
  return digits.length <= 11 ? 'FISICA' : 'JURIDICA';
}
