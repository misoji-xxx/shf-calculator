'use client'

import { EquipmentCoefficients, EquipmentOptions } from '@/types/calculator'
import { MasterType } from './MasterTypeSelector'
import styles from './EquipmentUpgradeGrid.module.css'

interface EquipmentUpgradeGridProps {
  coefficients: EquipmentCoefficients
  options: EquipmentOptions
  onCoefficientsChange: (coefficients: EquipmentCoefficients) => void
  onOptionsChange: (options: EquipmentOptions) => void
  masterType: MasterType
  equipments: import('@/types/calculator').EquipmentData | null
  equipmentTiers: import('@/types/calculator').EquipmentTierSettings
}

// 既存システムと同じ補正率選択肢
const CANVAS_COEFFICIENTS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130]
const MOTIF_COEFFICIENTS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130]
const PIPETTE_COEFFICIENTS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130]
const MIXER_SPEED_COEFFICIENTS = [0, 50, 100]
const MIXER_EFFICIENCY_OPTIONS = [50, 60, 80, 90, 100, 130]
const SCISSORS_COEFFICIENTS = [0, 30, 50, 80, 130]
const ALBEDO_SPEED_COEFFICIENTS = [0, 50, 100]
const ALBEDO_EFFICIENCY_OPTIONS = [33, 66, 100]

export default function EquipmentUpgradeGrid({
  coefficients,
  options,
  onCoefficientsChange,
  onOptionsChange,
  masterType,
  equipments,
  equipmentTiers
}: EquipmentUpgradeGridProps) {

  const handleCoefficientChange = (key: keyof EquipmentCoefficients, value: number) => {
    onCoefficientsChange({
      ...coefficients,
      [key]: value
    })
  }

  const handleOptionChange = (key: keyof EquipmentOptions, value: boolean) => {
    onOptionsChange({
      ...options,
      [key]: value
    })
  }

  // 設備アイコンを取得する関数
  const getEquipmentIcon = (equipmentType: string, tier?: string) => {
    if (!equipments) return ''

    const equipment = equipments[equipmentType as keyof typeof equipments]
    if (!equipment) return ''

    // 性能指定がある場合は性能別アイコンを取得
    if (tier && equipment.tiers && equipment.tiers[tier as keyof typeof equipment.tiers]) {
      return equipment.tiers[tier as keyof typeof equipment.tiers].icon || equipment.icon || ''
    }

    return equipment.icon || ''
  }

  return (
    <div className="settingRow">
      <label className="settingLabel">設備補正率</label>
      <div className="settingOptions">
        <div className={styles.unlockGrid}>

        {/* キャンバス補正率 */}
        <div className={styles.unlockGridColumn}>
          <div className={styles.unlockGridHeader}>
            <img src={getEquipmentIcon('canvas', equipmentTiers.canvas)} alt="canvas" className={styles.unlockGridIcon} />
            <span>キャンバス補正率</span>
          </div>
          <select
            className={styles.unlockGridSelect}
            value={coefficients.canvas}
            onChange={(e) => handleCoefficientChange('canvas', parseInt(e.target.value))}
          >
            {CANVAS_COEFFICIENTS.map((coef) => (
              <option key={coef} value={coef}>+{coef}%</option>
            ))}
          </select>
        </div>

        {/* モチーフメーカー補正率 */}
        <div className={styles.unlockGridColumn}>
          <div className={styles.unlockGridHeader}>
            <img src={getEquipmentIcon('motifMaker', equipmentTiers.motifMaker)} alt="motifMaker" className={styles.unlockGridIcon} />
            <span>モチーフメーカー補正率</span>
          </div>
          <select
            className={styles.unlockGridSelect}
            value={coefficients.motifMaker}
            onChange={(e) => handleCoefficientChange('motifMaker', parseInt(e.target.value))}
          >
            {MOTIF_COEFFICIENTS.map((coef) => (
              <option key={coef} value={coef}>+{coef}%</option>
            ))}
          </select>
        </div>

        {/* スポイト補正率 */}
        <div className={styles.unlockGridColumn}>
          <div className={styles.unlockGridHeader}>
            <img src={getEquipmentIcon('pipette', equipmentTiers.pipette)} alt="pipette" className={styles.unlockGridIcon} />
            <span>スポイト補正率</span>
          </div>
          <select
            className={styles.unlockGridSelect}
            value={coefficients.pipette}
            onChange={(e) => handleCoefficientChange('pipette', parseInt(e.target.value))}
          >
            {PIPETTE_COEFFICIENTS.map((coef) => (
              <option key={coef} value={coef}>+{coef}%</option>
            ))}
          </select>
        </div>

        {/* ミキサー補正率 */}
        <div className={styles.unlockGridColumn}>
          <div className={styles.unlockGridHeader}>
            <img src={getEquipmentIcon('mixer')} alt="mixer" className={styles.unlockGridIcon} />
            <span>ミキサー補正率</span>
          </div>
          <div className={styles.unlockGridRow}>
            <span>速度</span>
            <select
              className={styles.unlockGridSelect}
              value={coefficients.mixer}
              onChange={(e) => handleCoefficientChange('mixer', parseInt(e.target.value))}
            >
              {MIXER_SPEED_COEFFICIENTS.map((coef) => (
                <option key={coef} value={coef}>+{coef}%</option>
              ))}
            </select>
          </div>
          <div className={styles.unlockGridRow}>
            <span>効率</span>
            <select
              className={styles.unlockGridSelect}
              value={coefficients.mixerEfficiency}
              onChange={(e) => handleCoefficientChange('mixerEfficiency', parseInt(e.target.value))}
            >
              {MIXER_EFFICIENCY_OPTIONS.map((eff) => (
                <option key={eff} value={eff}>{eff}%</option>
              ))}
            </select>
          </div>
        </div>

        {/* ハサミ補正率 */}
        <div className={styles.unlockGridColumn}>
          <div className={styles.unlockGridHeader}>
            <img src={getEquipmentIcon('scissors')} alt="scissors" className={styles.unlockGridIcon} />
            <span>ハサミ補正率</span>
          </div>
          <select
            className={styles.unlockGridSelect}
            value={coefficients.scissors}
            onChange={(e) => handleCoefficientChange('scissors', parseInt(e.target.value))}
          >
            {SCISSORS_COEFFICIENTS.map((coef) => (
              <option key={coef} value={coef}>+{coef}%</option>
            ))}
          </select>
          <label className="checkbox__label">
            <input
              type="checkbox"
              checked={options.scissorsPort2}
              onChange={(e) => handleOptionChange('scissorsPort2', e.target.checked)}
            />
            <span className="checkbox__text">出力ポート×2</span>
          </label>
        </div>

        {/* アルベドメーカー補正率（スペルマスター時のみ表示） */}
        {masterType === 'spell' && (
          <div className={styles.unlockGridColumn}>
            <div className={styles.unlockGridHeader}>
              <img src={getEquipmentIcon('albedoMaker')} alt="albedoMaker" className={styles.unlockGridIcon} />
              <span>アルベドメーカー補正率</span>
            </div>
            <div className={styles.unlockGridRow}>
              <span>速度</span>
              <select
                className={styles.unlockGridSelect}
                value={coefficients.albedo}
                onChange={(e) => handleCoefficientChange('albedo', parseInt(e.target.value))}
              >
                {ALBEDO_SPEED_COEFFICIENTS.map((coef) => (
                  <option key={coef} value={coef}>+{coef}%</option>
                ))}
              </select>
            </div>
            <div className={styles.unlockGridRow}>
              <span>効率</span>
              <select
                className={styles.unlockGridSelect}
                value={coefficients.albedoEfficiency}
                onChange={(e) => handleCoefficientChange('albedoEfficiency', parseInt(e.target.value))}
              >
                {ALBEDO_EFFICIENCY_OPTIONS.map((eff) => (
                  <option key={eff} value={eff}>{eff}%</option>
                ))}
              </select>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  )
}