import React from 'react';
import styles from './SliderInput.module.css';

export interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '%',
  disabled = false,
}) => {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <label htmlFor="slider-range-input" className={styles.label}>
          {label}
        </label>
        <span className={styles.valueBadge}>
          {value}
          <span className={styles.unitText}>{unit}</span>
        </span>
      </div>

      <div className={styles.sliderTrackWrapper}>
        <input
          id="slider-range-input"
          type="range"
          className={styles.rangeInput}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--primary) ${percent}%, var(--bg-inset) ${percent}%)`,
          }}
        />
      </div>

      <div className={styles.scaleTicks}>
        <span>{min}{unit}</span>
        <span>{Math.round((min + max) / 2)}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};
