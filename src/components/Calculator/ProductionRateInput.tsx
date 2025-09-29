'use client'

import { useState, useEffect } from 'react'
import styles from './ProductionRateInput.module.css'

interface ProductionRateInputProps {
  value: number
  onChange: (value: number) => void
}

export default function ProductionRateInput({ 
  value, 
  onChange 
}: ProductionRateInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  const [isValid, setIsValid] = useState(true)

  // 外部からのvalue変更を反映
  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // バリデーション（SYSTEM_BEHAVIOR.mdの仕様に従う）
    const numValue = parseFloat(newValue)
    
    if (isNaN(numValue) || numValue < 1) {
      setIsValid(false)
      return
    }

    // 整数にクランプ（小数は切り捨て）
    const clampedValue = Math.max(1, Math.floor(numValue))
    setIsValid(true)
    
    if (clampedValue !== value) {
      onChange(clampedValue)
    }
  }

  const handleBlur = () => {
    // フォーカスが外れた時に値を正規化
    if (!isValid || inputValue === '') {
      const normalizedValue = Math.max(1, Math.floor(parseFloat(inputValue) || 1))
      setInputValue(normalizedValue.toString())
      setIsValid(true)
      onChange(normalizedValue)
    }
  }

  return (
    <div className="settingRow">
      <label className="settingLabel">目標生産速度</label>
      <div className="settingOptions">
        <div className={styles.inputGroup}>
          <input
            type="number"
            min="1"
            step="1"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`${styles.numberInput} ${!isValid ? styles.invalid : ''}`}
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <span className={styles.inputSuffix}>/s</span>
        </div>
        {!isValid && (
          <div className="error">
            1以上の整数を入力してください
          </div>
        )}
      </div>
    </div>
  )
}