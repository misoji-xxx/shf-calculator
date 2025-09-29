'use client'

import { CalculationOptions as CalcOptions } from '@/types/calculator'
import styles from './CalculationOptions.module.css'

interface CalculationOptionsProps {
  options: CalcOptions
  onOptionsChange: (options: CalcOptions) => void
}

export default function CalculationOptions({ options, onOptionsChange }: CalculationOptionsProps) {
  
  const handleOptionChange = (key: keyof CalcOptions, value: boolean) => {
    onOptionsChange({
      ...options,
      [key]: value
    })
  }

  return (
    <div className="settingRow">
      <label className="settingLabel">その他</label>
      <div className="settingOptions">
        <div className={styles.otherOptions}>
          
          <label className="checkbox__label">
            <input
              type="checkbox"
              checked={options.bigMotifBonus}
              onChange={(e) => handleOptionChange('bigMotifBonus', e.target.checked)}
            />
            <span className="checkbox__text">大きなモチーフで生産量を計算する(+100%)</span>
          </label>

          <label className="checkbox__label">
            <input
              type="checkbox"
              checked={options.tutuPort2}
              onChange={(e) => handleOptionChange('tutuPort2', e.target.checked)}
            />
            <span className="checkbox__text">チュチュハウスの生産量を2/1sで計算する</span>
          </label>

        </div>
      </div>
    </div>
  )
}