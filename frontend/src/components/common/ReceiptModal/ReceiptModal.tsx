import React, { useMemo } from 'react';
import { Printer, Check, Copy } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { SaleResponse, Product } from '../../../types';
import styles from './ReceiptModal.module.css';

export interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleResponse | null;
  products?: Product[];
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  products = [],
}) => {
  const [copied, setCopied] = React.useState(false);

  const productsMap = useMemo(() => {
    const map = new Map<number, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const lines = [
      `CUBEBOX - PEDIDO ${sale.order_number}`,
      `Data: ${new Date(sale.sale_date).toLocaleString('pt-BR')}`,
      `Cliente: ${sale.customer_nome || 'Consumidor Final'}`,
      `Total: R$ ${sale.net_total.toFixed(2)} (${sale.payment_method})`,
      'Itens:',
      ...sale.items.map((it) => {
        const name = it.product?.name || productsMap.get(it.product_id)?.name || `Item #${it.product_id}`;
        return `  ${it.quantity}x ${name} - R$ ${it.total_price.toFixed(2)}`;
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={`Espelho de Nota / Cupom (${sale.order_number})`}
    >
      <div className={styles.receiptContainer}>
        <div className={styles.receiptPaper}>
          <div className={styles.receiptHeader}>
            <div className={styles.storeName}>CUBEBOX CONVENIÊNCIA</div>
            <div className={styles.storeDetails}>CNPJ: 12.345.678/0001-90</div>
            <div className={styles.storeDetails}>Rua do Comércio, 1000 - São Paulo/SP</div>
            <div className={styles.receiptDivider} />
            <div style={{ fontWeight: 'bold' }}>DOCUMENTO NÃO FISCAL</div>
            <div style={{ fontSize: '10px' }}>EXTRATO DE COMPRA E VENDA</div>
          </div>

          <div className={styles.receiptMeta}>
            <div><strong>PEDIDO:</strong> {sale.order_number}</div>
            <div><strong>DATA:</strong> {new Date(sale.sale_date).toLocaleString('pt-BR')}</div>
            <div><strong>CLIENTE:</strong> {sale.customer_nome || 'Consumidor Final'}</div>
            {sale.status && <div><strong>STATUS:</strong> {sale.status}</div>}
            {sale.endereco_entrega_snapshot && (
              <div><strong>ENTREGA:</strong> {sale.endereco_entrega_snapshot}</div>
            )}
          </div>

          <div className={styles.receiptDivider} />

          <table className={styles.receiptItemsTable}>
            <thead>
              <tr>
                <th>ITEM COMERCIAL</th>
                <th style={{ textAlign: 'right' }}>QTD x VLR</th>
                <th style={{ textAlign: 'right' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it, idx) => {
                const prodName =
                  it.product?.name ||
                  productsMap.get(it.product_id)?.name ||
                  `Produto #${it.product_id}`;
                return (
                  <tr key={idx}>
                    <td>{prodName}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {it.quantity} x {it.unit_price.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {it.total_price.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className={styles.receiptDivider} />

          <div className={styles.receiptTotals}>
            <div className={styles.totalRow}>
              <span>SUBTOTAL:</span>
              <span>R$ {sale.gross_total.toFixed(2)}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className={styles.totalRow} style={{ color: '#b91c1c' }}>
                <span>DESCONTO:</span>
                <span>- R$ {sale.discount_amount.toFixed(2)}</span>
              </div>
            )}
            {sale.taxa_entrega ? (
              <div className={styles.totalRow}>
                <span>TAXA ENTREGA:</span>
                <span>+ R$ {sale.taxa_entrega.toFixed(2)}</span>
              </div>
            ) : null}
            <div className={`${styles.totalRow} ${styles.totalHighlight}`}>
              <span>TOTAL A PAGAR:</span>
              <span>R$ {sale.net_total.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>FORMA PAGTO:</span>
              <span>{sale.payment_method}</span>
            </div>
            <div className={styles.totalRow}>
              <span>MODALIDADE:</span>
              <span>{sale.tipo_entrega === 'ENTREGA' ? 'ENTREGA (DELIVERY)' : 'RETIRADA BALCÃO'}</span>
            </div>
            {sale.cpf_nota ? (
              <div className={styles.totalRow}>
                <span>CPF NA NOTA:</span>
                <span>{sale.cpf_nota}</span>
              </div>
            ) : null}
          </div>

          <div className={styles.receiptDivider} />

          <div className={styles.receiptFooter}>
            <div>Obrigado pela preferência!</div>
            <div>Volte sempre ao CubeBox!</div>
            <div className={styles.barcodeSimulated} aria-hidden="true">|| | | ||| | || |||| |</div>
            <div style={{ fontSize: '9px', marginTop: '4px' }}>AUT: {sale.order_number}</div>
          </div>
        </div>

        <div className={styles.actionsBar}>
          <Button variant="primary" icon={<Printer size={15} />} onClick={handlePrint}>
            Imprimir Cupom
          </Button>
          <Button
            variant="secondary"
            icon={copied ? <Check size={15} /> : <Copy size={15} />}
            onClick={handleCopySummary}
          >
            {copied ? 'Copiado!' : 'Copiar Resumo'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

