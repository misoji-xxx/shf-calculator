export interface Equipment {
  cycleSec?: number
  icon: string
  ratePerSec?: number
  baseCycleSec?: number
  bonus?: number
  efficiency?: number
  tiers?: {
    base: { cycleSec?: number; ratePerSec?: number; icon: string }
    high: { cycleSec?: number; ratePerSec?: number; icon: string }
    top: { cycleSec?: number; ratePerSec?: number; icon: string }
  }
}

export interface EquipmentData {
  canvas: Equipment
  compositeCanvas: Equipment
  motifMaker: Equipment
  pipette: Equipment
  spellGenerator?: Equipment
  mixer?: Equipment
  scissors?: Equipment
  tutuHouse?: Equipment
  albedoMaker?: Equipment
  inkBottleMaker?: Equipment
}

export interface Part {
  id: string
  name: string
  icon?: string
  outputPerCycle: number
  cycleSec: number
  recipe: Record<string, number>
}

export interface PartsData {
  parts: Part[]
}

export interface MotifsData {
  icons: Record<string, string[]>
}

export interface EquipmentCount {
  motifMaker?: number
  pipette?: number
  mixer?: number
  scissors?: number
  tutuHouse?: number
  albedoMaker?: number
  inkBottleMaker?: number
}

export type EquipmentTier = 'base' | 'high' | 'top'

export interface EquipmentTierSettings {
  canvas: EquipmentTier
  compositeCanvas: EquipmentTier
  motifMaker: EquipmentTier
  pipette: EquipmentTier
  spellGenerator: EquipmentTier
}

export interface SpellGeneratorOptions {
  tripleInkBottleConsumption: boolean // インク瓶3倍消費でスペル生産数2倍
}

export interface MotifProductionBoosts {
  circle: number    // 円モチーフのブースト率 (100-300%)
  square: number    // 四角モチーフのブースト率 (100-300%)
  triangle: number  // 三角モチーフのブースト率 (100-300%)
}

export interface EquipmentCoefficients {
  canvas: number        // キャンバス補正率 (0-130%)
  motifMaker: number    // モチーフメーカー補正率 (0-130%)
  pipette: number       // スポイト補正率 (0-130%)
  mixer: number         // ミキサー速度補正率 (0-100%)
  mixerEfficiency: number // ミキサー効率 (50-130%)
  scissors: number      // ハサミ補正率 (0-130%)
  albedo: number        // アルベドメーカー速度補正率 (0-100%)
  albedoEfficiency: number // アルベドメーカー効率 (33-100%)
}

export interface EquipmentOptions {
  scissorsPort2: boolean    // ハサミ出力ポート×2
  tutuPort2: boolean       // チュチュハウス出力ポート×2（2個/1秒）
}

export interface CalculationOptions {
  bigMotifBonus: boolean    // 大きなモチーフで生産量を計算する(+100%)
  tutuPort2: boolean       // チュチュハウスの生産量を2/1sで計算する
}

export interface MotifRequirement {
  count: number
  equipment: EquipmentCount
}

export interface RequirementNode {
  id: string
  name: string
  requiredRate: number
  canvasCount: number
  motifs: Record<string, MotifRequirement>
  children: RequirementNode[]
}