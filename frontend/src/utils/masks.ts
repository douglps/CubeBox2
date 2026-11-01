/**
 * Utilitários de Máscaras e Formatação para Campos de Formulário
 * Padrão Brasileiro (PT-BR) conforme diretrizes de UX e A11y
 */

export type MaskType = 'cpf' | 'cnpj' | 'cpf_cnpj' | 'phone' | 'cep';

/**
 * Remove qualquer caractere não numérico da string
 */
export const unmaskDigits = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\D/g, '');
};

/**
 * Máscara estrita de CPF: 000.000.000-00
 */
export const maskCpf = (value: string): string => {
  const digits = unmaskDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

/**
 * Máscara estrita de CNPJ: 00.000.000/0000-00
 */
export const maskCnpj = (value: string): string => {
  const digits = unmaskDigits(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

/**
 * Máscara dinâmica de CPF ou CNPJ baseada no número de dígitos digitados
 */
export const maskCpfCnpj = (value: string): string => {
  const digits = unmaskDigits(value);
  if (digits.length > 11) {
    return maskCnpj(digits);
  }
  return maskCpf(digits);
};

/**
 * Máscara dinâmica de Telefone Fixo (10 dígitos) ou Celular/WhatsApp (11 dígitos):
 * (00) 0000-0000 ou (00) 00000-0000
 */
export const maskPhone = (value: string): string => {
  const digits = unmaskDigits(value).slice(0, 11);
  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

/**
 * Máscara de CEP brasileiro: 00000-000
 */
export const maskCep = (value: string): string => {
  const digits = unmaskDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};

/**
 * Aplica a máscara indicada ou executa função customizada de mascaramento
 */
export const applyInputMask = (
  value: string,
  mask: MaskType | ((val: string) => string)
): string => {
  if (typeof mask === 'function') {
    return mask(value);
  }

  switch (mask) {
    case 'cpf':
      return maskCpf(value);
    case 'cnpj':
      return maskCnpj(value);
    case 'cpf_cnpj':
      return maskCpfCnpj(value);
    case 'phone':
      return maskPhone(value);
    case 'cep':
      return maskCep(value);
    default:
      return value;
  }
};
