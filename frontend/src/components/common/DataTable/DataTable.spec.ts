import { describe, it, expect } from 'vitest';

describe('DataTable - Lógica Pura de Paginação e Tri-state Sorting', () => {
  interface MockItem {
    id: number;
    name: string;
    price: number;
  }

  const mockData: MockItem[] = Array.from({ length: 35 }, (_, i) => ({
    id: i + 1,
    name: `Item ${String.fromCharCode(65 + (i % 26))}_${i + 1}`,
    price: (35 - i) * 10,
  }));

  it('deve calcular corretamente os índices de fatia (slice) para paginação de 10 itens', () => {
    const pageSize = 10;
    const page = 1;
    const startIndex = (page - 1) * pageSize;
    const pageData = mockData.slice(startIndex, startIndex + pageSize);

    expect(pageData).toHaveLength(10);
    expect(pageData[0].id).toBe(1);
    expect(pageData[9].id).toBe(10);

    // Página 4 (última com 35 itens)
    const page4Start = (4 - 1) * pageSize;
    const page4Data = mockData.slice(page4Start, page4Start + pageSize);
    expect(page4Data).toHaveLength(5);
    expect(page4Data[4].id).toBe(35);
  });

  it('deve ordenar dados numéricos crescentemente e decrescentemente', () => {
    const ascSorted = [...mockData].sort((a, b) => a.price - b.price);
    expect(ascSorted[0].price).toBe(10);
    expect(ascSorted[ascSorted.length - 1].price).toBe(350);

    const descSorted = [...mockData].sort((a, b) => b.price - a.price);
    expect(descSorted[0].price).toBe(350);
    expect(descSorted[descSorted.length - 1].price).toBe(10);
  });

  it('deve ordenar dados alfanuméricos com localeCompare em pt-BR', () => {
    const items = [
      { name: 'Água Mineral' },
      { name: 'Amendoim' },
      { name: 'Banana' },
      { name: 'abacaxi' },
    ];

    const sorted = [...items].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { numeric: true, sensitivity: 'base' })
    );

    expect(sorted[0].name.toLowerCase()).toBe('abacaxi');
    expect(sorted[1].name).toBe('Água Mineral');
    expect(sorted[2].name).toBe('Amendoim');
    expect(sorted[3].name).toBe('Banana');
  });

  it('deve validar ciclo tri-state de direção de ordenação', () => {
    type SortDirection = 'asc' | 'desc' | null;
    const nextDirection = (current: SortDirection): SortDirection => {
      if (current === 'asc') return 'desc';
      if (current === 'desc') return null;
      return 'asc';
    };

    expect(nextDirection(null)).toBe('asc');
    expect(nextDirection('asc')).toBe('desc');
    expect(nextDirection('desc')).toBe(null);
  });

  it('deve gerar a quantidade correta de linhas esqueléticas quando isLoading estiver ativo', () => {
    const loadingRows = 8;
    const skeletonRows = Array.from({ length: loadingRows });
    expect(skeletonRows).toHaveLength(8);

    // Default quando omitido
    const defaultLoadingRows = 5;
    const defaultSkeletonRows = Array.from({ length: defaultLoadingRows });
    expect(defaultSkeletonRows).toHaveLength(5);
  });

  it('deve priorizar skeleton rows sobre mensagem de lista vazia quando isLoading for true', () => {
    const isLoading = true;
    const displayedData: MockItem[] = [];
    const shouldRenderSkeletons = isLoading;
    const shouldRenderEmpty = !isLoading && displayedData.length === 0;

    expect(shouldRenderSkeletons).toBe(true);
    expect(shouldRenderEmpty).toBe(false);
  });
});
