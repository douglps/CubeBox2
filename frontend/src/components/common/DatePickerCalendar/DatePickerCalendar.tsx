import React, { useEffect, useRef, useState } from 'react';
import styles from './DatePickerCalendar.module.css';

export interface DatePickerCalendarProps {
  label?: string;
  valueDate: string; // formato ISO YYYY-MM-DD
  onChangeDate: (newDateIso: string) => void;
  helperText?: string;
  disabled?: boolean;
}

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  label = 'Data de Movimentação / Vencimento',
  valueDate,
  onChangeDate,
  helperText = 'Digite a data (DD/MM/AAAA) ou selecione no calendário suspenso',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  // Converte YYYY-MM-DD para DD/MM/AAAA
  const isoToBr = (iso: string): string => {
    if (!iso || !iso.includes('-')) return '';
    const parts = iso.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return '';
  };

  // Converte DD/MM/AAAA para YYYY-MM-DD
  const brToIso = (br: string): string | null => {
    const parts = br.split('/');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return null;
  };

  const [rawInput, setRawInput] = useState(isoToBr(valueDate));
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincroniza rawInput quando valueDate muda externamente
  useEffect(() => {
    setRawInput(isoToBr(valueDate));
  }, [valueDate]);

  // Data de navegação interna do calendário
  const [navDate, setNavDate] = useState(() => {
    return valueDate ? new Date(`${valueDate}T00:00:00`) : new Date();
  });

  const year = navDate.getFullYear();
  const month = navDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Fecha o popup ao clicar fora ou apertar Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setViewMode('days');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Máscara automática DD/MM/AAAA ao digitar no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let clean = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = clean;

    if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    if (clean.length > 4) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4, 8)}`;
    }

    setRawInput(formatted);

    if (clean.length === 8) {
      const validIso = brToIso(formatted);
      if (validIso) {
        onChangeDate(validIso);
        setNavDate(new Date(`${validIso}T00:00:00`));
      }
    }
  };

  // Cálculo de dias do mês
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const handleSelectDay = (day: number) => {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const iso = `${year}-${formattedMonth}-${formattedDay}`;
    onChangeDate(iso);
    setRawInput(`${formattedDay}/${formattedMonth}/${year}`);
    setIsOpen(false);
    setViewMode('days');
  };

  const handleSelectMonth = (mIndex: number) => {
    setNavDate(new Date(year, mIndex, 1));
    setViewMode('days');
  };

  const handleSelectYear = (y: number) => {
    setNavDate(new Date(y, month, 1));
    setViewMode('days');
  };

  // Cálculo das datas rápidas (Ontem, Hoje, Amanhã) e marcação do dia atual
  const todayObj = new Date();
  const formatIsoDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayIso = formatIsoDate(todayObj);

  const yesterdayObj = new Date();
  yesterdayObj.setDate(todayObj.getDate() - 1);
  const yesterdayIso = formatIsoDate(yesterdayObj);

  const tomorrowObj = new Date();
  tomorrowObj.setDate(todayObj.getDate() + 1);
  const tomorrowIso = formatIsoDate(tomorrowObj);

  const handleSelectQuickDate = (targetIso: string) => {
    onChangeDate(targetIso);
    setRawInput(isoToBr(targetIso));
    const targetDate = new Date(`${targetIso}T00:00:00`);
    setNavDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
    setIsOpen(false);
    setViewMode('days');
  };

  // Lista de anos para seletor (ano atual - 10 até ano atual + 10)
  const currentYear = new Date().getFullYear();
  const yearsList = [];
  for (let y = currentYear - 6; y <= currentYear + 8; y++) {
    yearsList.push(y);
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.inputBox}>
        <input
          type="text"
          className={styles.input}
          placeholder="DD/MM/AAAA"
          value={rawInput}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setRawInput('');
              onChangeDate('');
              setIsOpen(false);
            }
          }}
          disabled={disabled}
        />

        {/* Botão de Limpar Data com Lucide X */}
        {rawInput && !disabled && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              setRawInput('');
              onChangeDate('');
            }}
            title="Limpar data (Esc)"
            aria-label="Limpar data (Esc)"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Botão de Disparo do Calendário com Lucide Calendar */}
        <button
          type="button"
          className={styles.calendarTriggerBtn}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              setViewMode('days');
            }
          }}
          aria-label="Abrir calendário"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {helperText && <span className={styles.helperText}>{helperText}</span>}

      {/* POPUP SUSPENSO DO CALENDÁRIO */}
      {isOpen && (
        <div className={styles.calendarPopup}>
          {/* Cabeçalho com botões para alternar Ano e Mês */}
          <div className={styles.popupHeader}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => {
                if (viewMode === 'days') setNavDate(new Date(year, month - 1, 1));
                if (viewMode === 'years') setNavDate(new Date(year - 10, month, 1));
              }}
              aria-label="Anterior"
            >
              ‹
            </button>

            <div className={styles.selectorsGroup}>
              <button
                type="button"
                className={`${styles.selectorBtn} ${viewMode === 'months' ? styles.selectorBtnActive : ''}`}
                onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
              >
                {monthNames[month]} ▾
              </button>
              <button
                type="button"
                className={`${styles.selectorBtn} ${viewMode === 'years' ? styles.selectorBtnActive : ''}`}
                onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
              >
                {year} ▾
              </button>
            </div>

            <button
              type="button"
              className={styles.navBtn}
              onClick={() => {
                if (viewMode === 'days') setNavDate(new Date(year, month + 1, 1));
                if (viewMode === 'years') setNavDate(new Date(year + 10, month, 1));
              }}
              aria-label="Próximo"
            >
              ›
            </button>
          </div>

          {/* ATALHOS RÁPIDOS: ONTEM, HOJE, AMANHÃ */}
          <div className={styles.shortcutsRow}>
            <button
              type="button"
              className={`${styles.shortcutBtn} ${valueDate === yesterdayIso ? styles.shortcutBtnActive : ''}`}
              onClick={() => handleSelectQuickDate(yesterdayIso)}
            >
              Ontem
            </button>
            <button
              type="button"
              className={`${styles.shortcutBtn} ${valueDate === todayIso ? styles.shortcutBtnActive : ''}`}
              onClick={() => handleSelectQuickDate(todayIso)}
            >
              Hoje
            </button>
            <button
              type="button"
              className={`${styles.shortcutBtn} ${valueDate === tomorrowIso ? styles.shortcutBtnActive : ''}`}
              onClick={() => handleSelectQuickDate(tomorrowIso)}
            >
              Amanhã
            </button>
          </div>

          {/* VISTA 1: DIAS DO MÊS */}
          {viewMode === 'days' && (
            <div className={styles.daysGrid}>
              {daysOfWeek.map((d, idx) => (
                <span key={idx} className={styles.weekdayHeader}>
                  {d}
                </span>
              ))}

              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={idx} className={styles.emptyCell} />;
                }

                const formattedMonth = (month + 1).toString().padStart(2, '0');
                const formattedDay = day.toString().padStart(2, '0');
                const currentIso = `${year}-${formattedMonth}-${formattedDay}`;
                const isSelected = currentIso === valueDate;
                const isToday = currentIso === todayIso;

                return (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.dayBtn} ${isSelected ? styles.dayBtnSelected : ''} ${isToday ? styles.dayBtnToday : ''}`}
                    onClick={() => handleSelectDay(day)}
                    title={isToday ? `${day} (Hoje)` : undefined}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}

          {/* VISTA 2: SELETOR DE MÊS */}
          {viewMode === 'months' && (
            <div className={styles.monthsGrid}>
              {monthNames.map((mName, mIdx) => (
                <button
                  key={mName}
                  type="button"
                  className={`${styles.monthTile} ${mIdx === month ? styles.monthTileSelected : ''}`}
                  onClick={() => handleSelectMonth(mIdx)}
                >
                  {mName.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* VISTA 3: SELETOR DE ANO */}
          {viewMode === 'years' && (
            <div className={styles.yearsGrid}>
              {yearsList.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={`${styles.yearTile} ${y === year ? styles.yearTileSelected : ''}`}
                  onClick={() => handleSelectYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
