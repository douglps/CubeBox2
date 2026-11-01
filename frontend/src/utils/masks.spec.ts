import { describe, it, expect } from 'vitest';
import {
  unmaskDigits,
  maskCpf,
  maskCnpj,
  maskCpfCnpj,
  maskPhone,
  maskCep,
  applyInputMask,
} from './masks';

describe('Mask Utilities - Padrões Fiscais e Cadastrais PT-BR', () => {
  describe('unmaskDigits', () => {
    it('deve remover caracteres não numéricos corretamente', () => {
      expect(unmaskDigits('123.456.789-00')).toBe('12345678900');
      expect(unmaskDigits('(11) 98765-4321')).toBe('11987654321');
      expect(unmaskDigits('01310-100')).toBe('01310100');
      expect(unmaskDigits(null)).toBe('');
      expect(unmaskDigits(undefined)).toBe('');
    });
  });

  describe('maskCpf', () => {
    it('deve formatar CPF progressivamente e estritamente', () => {
      expect(maskCpf('123')).toBe('123');
      expect(maskCpf('1234')).toBe('123.4');
      expect(maskCpf('123456')).toBe('123.456');
      expect(maskCpf('12345678901')).toBe('123.456.789-01');
      expect(maskCpf('12345678901999')).toBe('123.456.789-01'); // Limite 11 dígitos
    });
  });

  describe('maskCnpj', () => {
    it('deve formatar CNPJ com pontuação oficial SEFAZ', () => {
      expect(maskCnpj('12345678000195')).toBe('12.345.678/0001-95');
      expect(maskCnpj('12')).toBe('12');
      expect(maskCnpj('12345')).toBe('12.345');
    });
  });

  describe('maskCpfCnpj', () => {
    it('deve alternar dinamicamente entre CPF e CNPJ conforme o comprimento', () => {
      expect(maskCpfCnpj('12345678901')).toBe('123.456.789-01');
      expect(maskCpfCnpj('12345678000195')).toBe('12.345.678/0001-95');
    });
  });

  describe('maskPhone', () => {
    it('deve formatar telefone fixo (10 dígitos) e celular/whatsapp (11 dígitos)', () => {
      expect(maskPhone('1133334444')).toBe('(11) 3333-4444');
      expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
      expect(maskPhone('11')).toBe('(11');
    });
  });

  describe('maskCep', () => {
    it('deve formatar CEP postal de 8 dígitos', () => {
      expect(maskCep('01310100')).toBe('01310-100');
      expect(maskCep('01310')).toBe('01310');
    });
  });

  describe('applyInputMask', () => {
    it('deve chamar a função correspondente ao tipo informado', () => {
      expect(applyInputMask('12345678901', 'cpf')).toBe('123.456.789-01');
      expect(applyInputMask('11987654321', 'phone')).toBe('(11) 98765-4321');
      expect(applyInputMask('01310100', 'cep')).toBe('01310-100');
    });
  });
});
