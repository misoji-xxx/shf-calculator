'use client'

import { EquipmentTier, EquipmentTierSettings, SpellGeneratorOptions, EquipmentData } from '@/types/calculator'
import { useCalculatorContext } from '@/contexts/CalculatorContext'
import { useDatabase } from '@/hooks/useDatabase'
import styles from './EquipmentTierPanel.module.css'

interface EquipmentTierPanelProps {
  settings: EquipmentTierSettings
  onSettingsChange: (settings: EquipmentTierSettings) => void
  spellGeneratorOptions: SpellGeneratorOptions
  onSpellGeneratorOptionsChange: (options: SpellGeneratorOptions) => void
  masterType?: 'minion' | 'spell' // Contextからも取得可能にするためoptional
}

interface TierOption {
  tier: EquipmentTier
  label: string
  description: string
}

const tierOptions: TierOption[] = [
  { tier: 'base', label: '標準', description: '基本性能' },
  { tier: 'high', label: '高性能', description: '1.5倍速' },
  { tier: 'top', label: '最上位', description: '3倍速' }
]

const equipmentLabels = {
  canvas: 'キャンバス',
  compositeCanvas: '複合キャンバス',
  motifMaker: 'モチーフメーカー',
  pipette: 'スポイト',
  spellGenerator: 'スペルジェネレーター'
}

export default function EquipmentTierPanel({ settings, onSettingsChange, spellGeneratorOptions, onSpellGeneratorOptionsChange, masterType: propMasterType }: EquipmentTierPanelProps) {
  const context = useCalculatorContext()
  const { equipments } = useDatabase()

  // propsで渡された場合はそれを優先、なければContextから取得
  const masterType = propMasterType || context.selectedMaster

  // 設備アイコンを取得する関数
  const getEquipmentIcon = (equipmentType: keyof EquipmentData, tier: EquipmentTier): string => {
    if (!equipments || !equipments[equipmentType]) {
      return '/img/icon.webp' // フォールバック
    }

    const equipment = equipments[equipmentType]
    const tierData = equipment.tiers?.[tier]

    return tierData?.icon || equipment.icon || '/img/icon.webp'
  }

  const handleTierChange = (equipmentType: keyof EquipmentTierSettings, tier: EquipmentTier) => {
    onSettingsChange({
      ...settings,
      [equipmentType]: tier
    })
  }

  const handleSpellGeneratorOptionChange = (option: keyof SpellGeneratorOptions, value: boolean) => {
    onSpellGeneratorOptionsChange({
      ...spellGeneratorOptions,
      [option]: value
    })
  }

  // 基本設備（スペルジェネレーター以外）
  const basicEquipments = Object.entries(equipmentLabels).filter(([equipmentType]) =>
    equipmentType !== 'spellGenerator'
  )

  // スペルジェネレーター（スペルマスター時のみ）
  const spellEquipments = masterType === 'spell'
    ? Object.entries(equipmentLabels).filter(([equipmentType]) => equipmentType === 'spellGenerator')
    : []

  return (
    <div className="settingRow">
      <label className="settingLabel">設備性能</label>
      <div className="settingOptions">
        {/* 基本設備グループ */}
        <div className={styles.equipmentGroups}>
          {basicEquipments
            .map(([equipmentType, label]) => (
              <div key={equipmentType} className={styles.equipmentGroup}>
                <div className={styles.equipmentGroupLabel}>
                  {label}
                </div>

                <div className={styles.equipmentGroupTiers}>
                  {tierOptions.map(({ tier, label: tierLabel, description }) => (
                    <button
                      key={tier}
                      className={`${styles.tierCard} ${settings[equipmentType as keyof EquipmentTierSettings] === tier
                        ? 'selected'
                        : ''
                        }`}
                      onClick={() => handleTierChange(equipmentType as keyof EquipmentTierSettings, tier)}
                      title={description}
                    >
                      <img
                        src={getEquipmentIcon(equipmentType as keyof EquipmentData, tier)}
                        alt={`${label} ${tierLabel}`}
                        className={styles.tierCardIcon}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (!target.src.includes('icon.webp')) {
                            target.src = '/img/icon.webp'
                          }
                        }}
                      />
                      <span className={styles.tierCardName}>{tierLabel}</span>
                    </button>
                  ))}
                </div>

              </div>
            ))}
        </div>

        {/* スペル設備グループ（スペルマスター時のみ） */}
        {spellEquipments.length > 0 && (
          <div className={styles.spellEquipmentGroups}>
            {spellEquipments.map(([equipmentType, label]) => (
              <div key={equipmentType} className={styles.equipmentGroup}>
                <div className={styles.equipmentGroupLabel}>
                  {label}
                </div>

                <div className={styles.equipmentGroupTiers}>
                  {tierOptions.map(({ tier, label: tierLabel, description }) => (
                    <button
                      key={tier}
                      className={`${styles.tierCard} ${settings[equipmentType as keyof EquipmentTierSettings] === tier
                        ? 'selected'
                        : ''
                        }`}
                      onClick={() => handleTierChange(equipmentType as keyof EquipmentTierSettings, tier)}
                      title={description}
                    >
                      <img
                        src={getEquipmentIcon(equipmentType as keyof EquipmentData, tier)}
                        alt={`${label} ${tierLabel}`}
                        className={styles.tierCardIcon}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (!target.src.includes('icon.webp')) {
                            target.src = '/img/icon.webp'
                          }
                        }}
                      />
                      <span className={styles.tierCardName}>{tierLabel}</span>
                    </button>
                  ))}
                </div>

                {/* スペルジェネレーターの追加オプション */}
                <div className={styles.spellGeneratorOptions}>
                  <label className="checkbox__label">
                    <input
                      type="checkbox"
                      checked={spellGeneratorOptions.tripleInkBottleConsumption}
                      onChange={(e) => handleSpellGeneratorOptionChange('tripleInkBottleConsumption', e.target.checked)}
                    />
                    <span className="checkbox__text">インク瓶消費×3</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}