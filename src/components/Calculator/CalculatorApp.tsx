'use client'

import { useState, useEffect } from 'react'
import MasterTypeSelector, { MasterType } from './MasterTypeSelector'
import HeroGallery from './HeroGallery'
import ProductionRateInput from './ProductionRateInput'
import EquipmentTierPanel from './EquipmentTierPanel'
import MotifProductionBoosts from './MotifProductionBoosts'
import EquipmentUpgradeGrid from './EquipmentUpgradeGrid'
import CalculationOptions from './CalculationOptions'
import RequirementTree from './RequirementTree'
import { useDatabase } from '@/hooks/useDatabase'
import { useCalculation } from '@/hooks/useCalculation'
import { EquipmentTierSettings, SpellGeneratorOptions, MotifProductionBoosts as MotifBoosts, EquipmentCoefficients, EquipmentOptions, CalculationOptions as CalcOptions } from '@/types/calculator'
import { CalculatorProvider } from '@/contexts/CalculatorContext'
import styles from './CalculatorApp.module.css'

export default function CalculatorApp() {
  const [selectedMaster, setSelectedMaster] = useState<MasterType>('minion')
  const [selectedHero, setSelectedHero] = useState<string | null>(null)
  const [targetRate, setTargetRate] = useState<number>(1)
  const [showMaterials, setShowMaterials] = useState<boolean>(false)
  const [equipmentTiers, setEquipmentTiers] = useState<EquipmentTierSettings>({
    canvas: 'base',
    compositeCanvas: 'base',
    motifMaker: 'base',
    pipette: 'base',
    spellGenerator: 'base'
  })
  const [spellGeneratorOptions, setSpellGeneratorOptions] = useState<SpellGeneratorOptions>({
    tripleInkBottleConsumption: false
  })
  const [motifBoosts, setMotifBoosts] = useState<MotifBoosts>({
    circle: 100,
    square: 100,
    triangle: 100
  })
  const [equipmentCoefficients, setEquipmentCoefficients] = useState<EquipmentCoefficients>({
    canvas: 0,
    motifMaker: 0,
    pipette: 0,
    mixer: 0,
    mixerEfficiency: 50,
    scissors: 0,
    albedo: 0,
    albedoEfficiency: 33
  })
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOptions>({
    scissorsPort2: false,
    tutuPort2: false
  })
  const [calculationOptions, setCalculationOptions] = useState<CalcOptions>({
    bigMotifBonus: true,  // デフォルトON（既存システムと同じ）
    tutuPort2: true      // デフォルトON（既存システムと同じ）
  })
  const { heroes, spells, parts, equipments, motifs, loading, error, loadHeroes } = useDatabase()

  // マスタータイプ変更時にヒーローデータを読み込み
  useEffect(() => {
    loadHeroes(selectedMaster)
  }, [selectedMaster])

  // ヒーローデータ読み込み完了時に最初のヒーローを自動選択
  useEffect(() => {
    if (!loading && heroes.length > 0) {
      // 常にA(+S)ランクの最初のヒーロー（ドリアード）を選択
      const sOrAHeroes = heroes.filter(hero => hero.rank === 'S' || hero.rank === 'A')
      if (sOrAHeroes.length > 0) {
        setSelectedHero(sOrAHeroes[0].id)
      } else if (heroes.length > 0) {
        // A(+S)ランクがない場合は最初のヒーローを選択
        setSelectedHero(heroes[0].id)
      }
    }
  }, [loading, heroes])

  const handleMasterChange = (master: MasterType) => {
    setSelectedMaster(master)
  }

  const handleHeroSelect = (heroId: string) => {
    setSelectedHero(heroId)
  }

  const handleTargetRateChange = (rate: number) => {
    setTargetRate(rate)
  }

  const handleEquipmentTierChange = (settings: EquipmentTierSettings) => {
    setEquipmentTiers(settings)
  }

  const handleSpellGeneratorOptionsChange = (options: SpellGeneratorOptions) => {
    setSpellGeneratorOptions(options)
  }

  const handleMotifBoostChange = (motifType: keyof MotifBoosts, boost: number) => {
    setMotifBoosts(prev => ({
      ...prev,
      [motifType]: boost
    }))
  }

  const handleEquipmentCoefficientsChange = (coefficients: EquipmentCoefficients) => {
    setEquipmentCoefficients(coefficients)
  }

  const handleEquipmentOptionsChange = (options: EquipmentOptions) => {
    setEquipmentOptions(options)
  }

  const handleCalculationOptionsChange = (options: CalcOptions) => {
    setCalculationOptions(options)
  }

  // 選択されたヒーロー/スペルを取得
  const getSelectedEntity = () => {
    return heroes.find(h => h.id === selectedHero) || spells.find(s => s.id === selectedHero)
  }

  // 計算実行
  const selectedEntity = getSelectedEntity()
  const calculationResult = useCalculation(
    selectedEntity || null,
    targetRate,
    equipments,
    heroes,
    spells,
    parts,
    equipmentTiers,
    spellGeneratorOptions,
    motifBoosts,
    equipmentCoefficients,
    equipmentOptions,
    calculationOptions
  )

  const contextValue = {
    selectedMaster,
    equipmentTiers,
    targetRate,
    showMaterials,
    motifBoosts,
    equipmentCoefficients,
    equipmentOptions,
    calculationOptions
  }

  return (
    <CalculatorProvider value={contextValue}>
      <div className={styles.container}>
        <MasterTypeSelector
          selectedMaster={selectedMaster}
          onMasterChange={handleMasterChange}
        />

        {error && (
          <div className={styles.error}>
            エラー: {error}
          </div>
        )}

        <HeroGallery
          heroes={heroes}
          spells={spells}
          selectedHero={selectedHero}
          onHeroSelect={handleHeroSelect}
          loading={loading}
        />

        <ProductionRateInput
          value={targetRate}
          onChange={handleTargetRateChange}
        />

        <EquipmentTierPanel
          settings={equipmentTiers}
          onSettingsChange={handleEquipmentTierChange}
          spellGeneratorOptions={spellGeneratorOptions}
          onSpellGeneratorOptionsChange={handleSpellGeneratorOptionsChange}
          masterType={selectedMaster}
        />

        <MotifProductionBoosts
          motifBoosts={motifBoosts}
          onMotifBoostChange={handleMotifBoostChange}
        />

        <EquipmentUpgradeGrid
          coefficients={equipmentCoefficients}
          options={equipmentOptions}
          onCoefficientsChange={handleEquipmentCoefficientsChange}
          onOptionsChange={handleEquipmentOptionsChange}
          masterType={selectedMaster}
          equipments={equipments}
          equipmentTiers={equipmentTiers}
        />

        <CalculationOptions
          options={calculationOptions}
          onOptionsChange={handleCalculationOptionsChange}
        />

        <RequirementTree
          tree={calculationResult}
          motifs={motifs}
          heroes={heroes}
          spells={spells}
          parts={parts}
          showMaterials={showMaterials}
          onShowMaterialsChange={(checked) => setShowMaterials(checked)}
        />
      </div>
    </CalculatorProvider>
  )
}