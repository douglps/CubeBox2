/**
 * =============================================================================
 * ORQUESTRADOR PRINCIPAL DA APLICAÇÃO (SPA COCKPIT) - CUBEBOX 2.0 ENTERPRISE
 * =============================================================================
 * Projeto: CubeBox Enterprise
 * Função no Negócio:
 *     Gerencia a navegação entre as 7 áreas operacionais e comerciais:
 *     1. Painel Geral (Dashboard) - visão executiva de vendas e ruptura.
 *     2. Frente de Caixa (PDV) - vendas ágeis e cálculo de desconto.
 *     3. Controle de Estoque (Estoque) - reposição e gestão de perdas.
 *     4. Catálogo de Produtos (Produtos) - cadastro e congelamento de itens.
 *     5. Gestão de Clientes (Clientes) - CRM de balcão e fidelização.
 *     6. Histórico de Vendas (Pedidos) - consulta e reimpressão de cupons.
 *     7. Inteligência Preditiva (ML & Compras) - Random Forest e Regressão Logística.
 * =============================================================================
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppShell, NavTab } from './components/layout/AppShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CursorTooltipProvider } from './components/common/CursorTooltip';
import { ViewFallbackSkeleton } from './components/common/ViewFallbackSkeleton/ViewFallbackSkeleton';

// Code-splitting via Dynamic Imports (Lazy Loading com Suspense)
const DashboardView = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const PosView = lazy(() => import('./views/PosView').then(m => ({ default: m.PosView })));
const InventoryView = lazy(() => import('./views/InventoryView').then(m => ({ default: m.InventoryView })));
const ProductsView = lazy(() => import('./views/ProductsView').then(m => ({ default: m.ProductsView })));
const CustomersView = lazy(() => import('./views/CustomersView').then(m => ({ default: m.CustomersView })));
const OrdersHistoryView = lazy(() => import('./views/OrdersHistoryView').then(m => ({ default: m.OrdersHistoryView })));
const PredictiveView = lazy(() => import('./views/PredictiveView').then(m => ({ default: m.PredictiveView })));
const DesignSystemShowcase = lazy(() => import('./components/DesignSystemShowcase/DesignSystemShowcase').then(m => ({ default: m.DesignSystemShowcase })));

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <CursorTooltipProvider>
      <AppShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentTheme={theme}
        onToggleTheme={toggleTheme}
      >
        <ErrorBoundary>
          <Suspense fallback={<ViewFallbackSkeleton tab={activeTab} />}>
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateToPos={() => setActiveTab('pos')}
                onNavigateToPredictive={() => setActiveTab('predictive')}
              />
            )}
            {activeTab === 'pos' && <PosView />}
            {activeTab === 'inventory' && <InventoryView />}
            {activeTab === 'products' && <ProductsView />}
            {activeTab === 'customers' && <CustomersView />}
            {activeTab === 'orders' && <OrdersHistoryView />}
            {activeTab === 'predictive' && <PredictiveView />}
            {activeTab === 'design-system' && <DesignSystemShowcase />}
          </Suspense>
        </ErrorBoundary>
      </AppShell>
    </CursorTooltipProvider>
  );
};

export default App;
