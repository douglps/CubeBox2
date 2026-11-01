import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UserPlus,
  MapPin,
  ChevronDown,
  ChevronUp,
  Edit3,
  Star,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';
import { CustomerCreatePayload, Customer, CustomerAddress } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { TextInput } from '../../../components/common/TextInput';
import { InlineAlert } from '../../../components/common/InlineAlert';
import {
  createCustomer,
  updateCustomer,
  addCustomerAddress,
  setDefaultCustomerAddress,
} from '../../../services/api';
import { maskPhone, maskCpfCnpj, maskCep } from '../../../utils/masks';
import styles from './CustomerQuickCreateModal.module.css';

export interface CustomerQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrUpdatedCustomer: Customer) => void;
  customerToEdit?: Customer | null;
  initialShowAddress?: boolean;
}

export const CustomerQuickCreateModal: React.FC<CustomerQuickCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerToEdit,
  initialShowAddress = false,
}) => {
  // Dados básicos
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [ativo, setAtivo] = useState(true);

  // Controle de Endereços
  // Se for novo cliente, semEndereço é false por padrão (endereço é obrigatório, a menos que o usuário ative o switch)
  const [semEndereco, setSemEndereco] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [isUpdatingDefault, setIsUpdatingDefault] = useState(false);

  // Formulário para Novo Endereço
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [novoCep, setNovoCep] = useState('');
  const [novoLogradouro, setNovoLogradouro] = useState('');
  const [novoNumero, setNovoNumero] = useState('');
  const [novoComplemento, setNovoComplemento] = useState('');
  const [novoBairro, setNovoBairro] = useState('');
  const [novoCidade, setNovoCidade] = useState('');
  const [novoEstado, setNovoEstado] = useState('SP');
  const [setNovoAsDefault, setSetNovoAsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const newAddressSectionRef = useRef<HTMLDivElement>(null);

  // Ordena endereços salvos: Padrão sempre no topo
  const sortedAddresses = useMemo(() => {
    return [...savedAddresses].sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return a.id - b.id;
    });
  }, [savedAddresses]);

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        setNome(customerToEdit.nome || '');
        setTelefone(customerToEdit.telefone ? maskPhone(customerToEdit.telefone) : '');
        setCpfCnpj(customerToEdit.cpf_cnpj ? maskCpfCnpj(customerToEdit.cpf_cnpj) : '');
        setEmail(customerToEdit.email || '');
        setAtivo(customerToEdit.ativo ?? true);

        // Carrega endereços existentes
        const addrs = customerToEdit.enderecos || [];
        setSavedAddresses(addrs);

        const hasExisting = addrs.length > 0 || Boolean(customerToEdit.logradouro);
        setSemEndereco(!hasExisting);

        // Se veio para adicionar outro endereço explicitamente ou não tem nenhum
        if (initialShowAddress || !hasExisting) {
          setIsNewAddressOpen(true);
        } else {
          setIsNewAddressOpen(false);
        }

        // Reseta inputs de novo endereço
        setNovoCep('');
        setNovoLogradouro('');
        setNovoNumero('');
        setNovoComplemento('');
        setNovoBairro('');
        setNovoCidade('');
        setNovoEstado('SP');
        setSetNovoAsDefault(addrs.length === 0);
      } else {
        resetForm();
        setSemEndereco(false);
        setIsNewAddressOpen(true);
        setSetNovoAsDefault(true);
      }
    }
  }, [isOpen, customerToEdit, initialShowAddress]);

  const resetForm = () => {
    setNome('');
    setTelefone('');
    setCpfCnpj('');
    setEmail('');
    setAtivo(true);
    setSemEndereco(false);
    setSavedAddresses([]);
    setIsNewAddressOpen(true);
    setNovoCep('');
    setNovoLogradouro('');
    setNovoNumero('');
    setNovoComplemento('');
    setNovoBairro('');
    setNovoCidade('');
    setNovoEstado('SP');
    setSetNovoAsDefault(true);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Autocomplete de CEP via ViaCEP
  const handleCepLookup = async (rawCep: string) => {
    const formatted = maskCep(rawCep);
    setNovoCep(formatted);

    const digitsOnly = formatted.replace(/\D/g, '');
    if (digitsOnly.length === 8) {
      setIsSearchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digitsOnly}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setNovoLogradouro(data.logradouro || '');
            setNovoBairro(data.bairro || '');
            setNovoCidade(data.localidade || '');
            setNovoEstado((data.uf || 'SP').toUpperCase());
          }
        }
      } catch (err) {
        console.warn('Falha na consulta automática de CEP:', err);
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  // Ação de Tornar Padrão um endereço já salvo
  const handleMakeDefault = async (addrId: number) => {
    if (!customerToEdit) return;
    try {
      setIsUpdatingDefault(true);
      await setDefaultCustomerAddress(customerToEdit.id, addrId);
      const updated = savedAddresses.map((a) => ({
        ...a,
        is_default: a.id === addrId,
      }));
      setSavedAddresses(updated);

      // Notifica atualização parcial se necessário
      const defaultAddr = updated.find((a) => a.id === addrId);
      if (defaultAddr) {
        onSuccess({
          ...customerToEdit,
          enderecos: updated,
          logradouro: defaultAddr.logradouro,
          numero: defaultAddr.numero,
          complemento: defaultAddr.complemento,
          bairro: defaultAddr.bairro,
          cidade: defaultAddr.cidade,
          estado: defaultAddr.estado,
          cep: defaultAddr.cep,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao definir endereço padrão.');
    } finally {
      setIsUpdatingDefault(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validações básicas
    if (!nome.trim() || nome.trim().length < 2) {
      setErrorMessage('Informe o nome completo do cliente (mínimo 2 letras).');
      return;
    }

    const cleanPhone = telefone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('O telefone com DDD é obrigatório (mínimo 10 dígitos).');
      return;
    }

    const hasNewAddressFilled = Boolean(
      novoLogradouro.trim() || novoCep.trim() || novoNumero.trim() || novoBairro.trim()
    );

    // Se NÃO for semEndereco e NÃO tiver endereços salvos: o novo endereço é obrigatório
    if (!semEndereco && savedAddresses.length === 0) {
      if (!novoLogradouro.trim()) {
        setErrorMessage('O logradouro/rua é obrigatório. Ou marque a opção "Cliente sem endereço (apenas balcão)".');
        return;
      }
      if (!novoNumero.trim()) {
        setErrorMessage('O número do endereço é obrigatório (ou informe S/N).');
        return;
      }
      if (!novoBairro.trim()) {
        setErrorMessage('O bairro é obrigatório.');
        return;
      }
      if (!novoCidade.trim()) {
        setErrorMessage('A cidade é obrigatória.');
        return;
      }
    }

    // Se o usuário abriu o colapsável e preencheu parcialmente
    if (isNewAddressOpen && hasNewAddressFilled && !novoLogradouro.trim()) {
      setErrorMessage('Informe o logradouro completo para o novo endereço.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CustomerCreatePayload = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        cpf_cnpj: cpfCnpj.trim() || undefined,
        email: email.trim() || undefined,
        ativo,
      };

      // Se temos novo endereço a ser incluído
      if (!semEndereco && hasNewAddressFilled && novoLogradouro.trim()) {
        const isDefault = savedAddresses.length === 0 ? true : setNovoAsDefault;
        payload.enderecos = [
          {
            apelido: savedAddresses.length === 0 ? 'Principal' : 'Entrega',
            cep: novoCep.trim() || '01001-000',
            logradouro: novoLogradouro.trim(),
            numero: novoNumero.trim() || 'S/N',
            complemento: novoComplemento.trim() || undefined,
            bairro: novoBairro.trim() || 'Bairro',
            cidade: novoCidade.trim() || 'São Paulo',
            estado: (novoEstado.trim().toUpperCase() || 'SP').slice(0, 2),
            is_default: isDefault,
          },
        ];

        if (isDefault) {
          payload.cep = novoCep.trim() || '01001-000';
          payload.logradouro = novoLogradouro.trim();
          payload.numero = novoNumero.trim() || 'S/N';
          payload.complemento = novoComplemento.trim() || undefined;
          payload.bairro = novoBairro.trim() || 'Bairro';
          payload.cidade = novoCidade.trim() || 'São Paulo';
          payload.estado = (novoEstado.trim().toUpperCase() || 'SP').slice(0, 2);
        }
      }

      let resultCustomer: Customer;
      if (customerToEdit) {
        // Se estiver editando e adicionou novo endereço
        if (!semEndereco && hasNewAddressFilled && novoLogradouro.trim()) {
          const isDefault = savedAddresses.length === 0 ? true : setNovoAsDefault;
          await addCustomerAddress(customerToEdit.id, {
            apelido: 'Entrega',
            cep: novoCep.trim() || '01001-000',
            logradouro: novoLogradouro.trim(),
            numero: novoNumero.trim() || 'S/N',
            complemento: novoComplemento.trim() || undefined,
            bairro: novoBairro.trim() || 'Bairro',
            cidade: novoCidade.trim() || 'São Paulo',
            estado: (novoEstado.trim().toUpperCase() || 'SP').slice(0, 2),
            is_default: isDefault,
          });
        }
        resultCustomer = await updateCustomer(customerToEdit.id, payload);
      } else {
        resultCustomer = await createCustomer(payload);
      }

      resetForm();
      onSuccess(resultCustomer);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao salvar dados do cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(customerToEdit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? `Editar Cliente: ${customerToEdit?.nome}` : 'Cadastrar Cliente'}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={isEditing ? <Edit3 size={16} /> : <UserPlus size={16} />}
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {isEditing ? 'Salvar Alterações' : 'Salvar Cliente'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {errorMessage && (
          <InlineAlert
            variant="error"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {/* Linha 1: Nome Completo */}
        <div className={styles.formRow}>
          <TextInput
            label="Nome Completo *"
            placeholder="Ex: Mariana Silva Santos"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Linha 2: CPF/CNPJ e Telefone */}
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <TextInput
              label="CPF ou CNPJ"
              placeholder="Ex: 123.456.789-00 ou 12.345.678/0001-90"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(maskCpfCnpj(e.target.value))}
            />
          </div>
          <div className={styles.formRow}>
            <TextInput
              label="Telefone / WhatsApp *"
              placeholder="Ex: (11) 98765-4321"
              value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Linha 3: E-mail e Status (Pills Toggle) */}
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <TextInput
              label="E-mail"
              placeholder="Ex: mariana.silva@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formRow}>
            <label className={styles.fieldLabel}>Status</label>
            <div className={styles.pillToggleGroup} role="group" aria-label="Status">
              <button
                type="button"
                className={`${styles.pillBtn} ${ativo ? styles.pillBtnActive : ''}`}
                onClick={() => setAtivo(true)}
              >
                <CheckCircle2 size={13} />
                <span>ATIVO</span>
              </button>
              <button
                type="button"
                className={`${styles.pillBtn} ${!ativo ? styles.pillBtnInactive : ''}`}
                onClick={() => setAtivo(false)}
              >
                <XCircle size={13} />
                <span>INATIVO</span>
              </button>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE ENDEREÇO PARA ENTREGAS (DELIVERY) */}
        <div className={styles.addressSectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <MapPin size={14} color="var(--color-interactive-primary)" />
            <span className={styles.sectionTitle}>
              Endereço para Entregas (Delivery)
            </span>
          </div>

          <div
            className={styles.noAddressSwitchWrapper}
            role="switch"
            aria-checked={semEndereco}
            tabIndex={0}
            onClick={() => {
              const nextVal = !semEndereco;
              setSemEndereco(nextVal);
              if (nextVal) {
                setIsNewAddressOpen(false);
              } else {
                setIsNewAddressOpen(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const nextVal = !semEndereco;
                setSemEndereco(nextVal);
                if (nextVal) {
                  setIsNewAddressOpen(false);
                } else {
                  setIsNewAddressOpen(true);
                }
              }
            }}
            title="Ative se o cliente compra apenas no balcão e não necessita de entrega"
          >
            <div className={`${styles.toggleSwitch} ${semEndereco ? styles.toggleSwitchChecked : ''}`}>
              <div className={`${styles.toggleThumb} ${semEndereco ? styles.toggleThumbChecked : ''}`} />
            </div>
            <span className={styles.toggleLabelText}>
              Apenas balcão (sem entrega)
            </span>
          </div>
        </div>

        {!semEndereco && (
          <>
            {/* Bloco Compacto de Endereços já Salvos (se houver) */}
            {sortedAddresses.length > 0 && (
              <div className={styles.savedAddressesList}>
                {sortedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`${styles.addressItemCard} ${
                      addr.is_default ? styles.addressItemCardDefault : ''
                    }`}
                  >
                    <div className={styles.addressItemContent}>
                      <div className={styles.addressItemHeader}>
                        <span className={styles.addressAlias}>{addr.apelido || 'Endereço'}</span>
                        {addr.is_default && (
                          <span className={styles.defaultBadge}>
                            <Star size={10} fill="currentColor" /> Padrão
                          </span>
                        )}
                      </div>
                      <span className={styles.addressItemDetails}>
                        {addr.logradouro}, nº {addr.numero} {addr.complemento ? `(${addr.complemento})` : ''} • {addr.bairro} - {addr.cidade}/{addr.estado} • CEP {maskCep(addr.cep)}
                      </span>
                    </div>

                    {/* Quando o endereço já for o padrão NÃO deve exibir opção tornar padrão */}
                    {!addr.is_default && (
                      <button
                        type="button"
                        className={styles.makeDefaultBtn}
                        onClick={() => handleMakeDefault(addr.id)}
                        disabled={isUpdatingDefault}
                        title="Definir este endereço como o padrão de entrega"
                      >
                        <Star size={12} />
                        <span>Tornar Padrão</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Colapsável para Cadastrar / Adicionar Outro Endereço */}
            {sortedAddresses.length > 0 && (
              <button
                type="button"
                className={styles.accordionToggleBtn}
                onClick={() => setIsNewAddressOpen(!isNewAddressOpen)}
              >
                <div className={styles.accordionLeft}>
                  <Plus size={14} color="var(--color-interactive-primary)" />
                  <span>+ Adicionar outro endereço de entrega</span>
                </div>
                {isNewAddressOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}

            {/* Formulário de Novo Endereço */}
            {isNewAddressOpen && (
              <div className={styles.accordionContent} ref={newAddressSectionRef}>
                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <TextInput
                      label={`CEP ${isSearchingCep ? '(Buscando...)' : ''}`}
                      placeholder="00000-000"
                      value={novoCep}
                      onChange={(e) => handleCepLookup(e.target.value)}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <TextInput
                      label="Logradouro / Rua / Avenida *"
                      placeholder="Ex: Av. Paulista"
                      value={novoLogradouro}
                      onChange={(e) => setNovoLogradouro(e.target.value)}
                      required={!semEndereco && sortedAddresses.length === 0}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <TextInput
                      label="Número *"
                      placeholder="1000"
                      value={novoNumero}
                      onChange={(e) => setNovoNumero(e.target.value)}
                      required={!semEndereco && sortedAddresses.length === 0}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <TextInput
                      label="Complemento"
                      placeholder="Apto 42, Bloco B"
                      value={novoComplemento}
                      onChange={(e) => setNovoComplemento(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <TextInput
                      label="Bairro *"
                      placeholder="Bela Vista"
                      value={novoBairro}
                      onChange={(e) => setNovoBairro(e.target.value)}
                      required={!semEndereco && sortedAddresses.length === 0}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <TextInput
                      label="Cidade / UF *"
                      placeholder="São Paulo / SP"
                      value={novoCidade ? `${novoCidade} / ${novoEstado}` : ''}
                      onChange={(e) => {
                        const parts = e.target.value.split('/');
                        setNovoCidade(parts[0]?.trim() || '');
                        if (parts[1]) setNovoEstado(parts[1].trim().toUpperCase().slice(0, 2));
                      }}
                      required={!semEndereco && sortedAddresses.length === 0}
                    />
                  </div>
                </div>

                {sortedAddresses.length > 0 && (
                  <label className={styles.setNewAsDefaultRow}>
                    <input
                      type="checkbox"
                      className={styles.checkboxCustom}
                      checked={setNovoAsDefault}
                      onChange={(e) => setSetNovoAsDefault(e.target.checked)}
                    />
                    <span>Definir este novo endereço como o padrão de entrega</span>
                  </label>
                )}
              </div>
            )}
          </>
        )}
      </form>
    </Modal>
  );
};
