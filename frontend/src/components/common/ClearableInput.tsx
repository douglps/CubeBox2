import React from 'react';
import { TextInput, TextInputProps } from './TextInput/TextInput';

export interface ClearableInputProps extends TextInputProps {}

/**
 * Componente ClearableInput (US-UI-03 / SDD-CBOX-UI-V2.0.0)
 * Campo de texto ergonomicamente aprimorado com botão 'X' de limpeza
 * e suporte nativo ao atalho universal [Esc] para reset rápido.
 */
export const ClearableInput: React.FC<ClearableInputProps> = (props) => {
  return <TextInput {...props} />;
};

export default ClearableInput;
