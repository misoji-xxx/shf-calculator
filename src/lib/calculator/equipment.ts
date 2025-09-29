import { EquipmentData, EquipmentCount, MotifRequirement } from '@/types/calculator'

/**
 * 設備のデフォルト設定（簡易版）
 */
export interface EquipmentSettings {
  // 基本設備レート（後で設定UIから取得）
  pipetteRate: number
  mixerRate: number
  scissorsSec: number
  tutuRate: number
  albedoRate: number
  inkBottleRate: number
  motifMakerRates: {
    circle: number
    square: number
    triangle: number
  }
  // オプション
  scissorsPort2: boolean
}

/**
 * 設備設定を equipments.json から計算
 */
export function buildEquipmentSettings(
  equipments: EquipmentData,
  tierSettings?: import('@/types/calculator').EquipmentTierSettings,
  motifBoosts?: import('@/types/calculator').MotifProductionBoosts,
  equipmentCoefficients?: import('@/types/calculator').EquipmentCoefficients,
  equipmentOptions?: import('@/types/calculator').EquipmentOptions,
  calculationOptions?: import('@/types/calculator').CalculationOptions
): EquipmentSettings {
  // 性能設定に基づいて実効レートを計算
  const pipetteBaseRate = tierSettings?.pipette
    ? equipments.pipette?.tiers?.[tierSettings.pipette]?.ratePerSec || equipments.pipette?.ratePerSec || 3
    : equipments.pipette?.ratePerSec || 3

  // スポイト補正率を適用
  const coefPipettePct = equipmentCoefficients?.pipette ?? 0
  const pipetteRate = pipetteBaseRate * (1 + Math.max(0, coefPipettePct) / 100)

  const motifMakerCycleSec = tierSettings?.motifMaker
    ? equipments.motifMaker?.tiers?.[tierSettings.motifMaker]?.cycleSec || equipments.motifMaker?.baseCycleSec || 2.0
    : equipments.motifMaker?.baseCycleSec || 2.0

  // その他の設備（性能設定なし）
  const mixerBaseRate = equipments.mixer?.ratePerSec || 1
  const scissorsBaseSec = equipments.scissors?.cycleSec || 0.5
  const tutuBaseRate = equipments.tutuHouse?.ratePerSec || 1
  const albedoBaseRate = equipments.albedoMaker?.ratePerSec || 1
  const inkBottleBaseRate = equipments.inkBottleMaker?.ratePerSec || 1
  const motifBonus = equipments.motifMaker?.bonus || 2

  // 基本モチーフメーカーレート（既存システムの計算ロジックに合わせる）
  // 大きなモチーフボーナスの適用
  const bigMotifBonusOn = calculationOptions?.bigMotifBonus ?? true
  const effectiveBonus = bigMotifBonusOn ? motifBonus : 1

  // モチーフメーカー補正率を適用
  const coefMotifPct = equipmentCoefficients?.motifMaker ?? 0
  const baseMotifRate = (1 / motifMakerCycleSec * effectiveBonus) * (1 + Math.max(0, coefMotifPct) / 100)

  // モチーフブースト設定を適用（デフォルトは100%）
  const circleBoost = (motifBoosts?.circle ?? 100) / 100
  const squareBoost = (motifBoosts?.square ?? 100) / 100
  const triangleBoost = (motifBoosts?.triangle ?? 100) / 100

  // ハサミ補正率と出力ポート×2を適用
  const coefScissorsPct = equipmentCoefficients?.scissors ?? 0
  const scissorsPort2 = equipmentOptions?.scissorsPort2 ?? false
  const scissorsSec = scissorsBaseSec / ((1 + Math.max(0, coefScissorsPct) / 100) * (scissorsPort2 ? 2 : 1))

  // ミキサー補正率と効率を適用
  const coefMixerPct = equipmentCoefficients?.mixer ?? 0
  const mixerEfficiencyPct = equipmentCoefficients?.mixerEfficiency ?? (equipments.mixer?.efficiency ? equipments.mixer.efficiency * 100 : 50)
  const mixerRate = mixerBaseRate * (1 + Math.max(0, coefMixerPct) / 100) * (mixerEfficiencyPct / 100)

  // アルベドメーカー補正率と効率を適用
  const coefAlbedoPct = equipmentCoefficients?.albedo ?? 0
  const albedoEfficiencyPct = equipmentCoefficients?.albedoEfficiency ?? (equipments.albedoMaker?.efficiency ? equipments.albedoMaker.efficiency * 100 : 33)
  const albedoRate = albedoBaseRate * (1 + Math.max(0, coefAlbedoPct) / 100) * (albedoEfficiencyPct / 100)

  // チュチュハウス2/1s設定を適用
  const tutuPort2 = calculationOptions?.tutuPort2 ?? true
  const tutuRate = tutuBaseRate * (tutuPort2 ? 2 : 1)

  return {
    pipetteRate,
    mixerRate,
    scissorsSec,
    tutuRate,
    albedoRate,
    inkBottleRate: inkBottleBaseRate,
    motifMakerRates: {
      circle: baseMotifRate * circleBoost,
      square: baseMotifRate * squareBoost,
      triangle: baseMotifRate * triangleBoost
    },
    scissorsPort2
  }
}

/**
 * デフォルト設備設定（既存システムの既定値に合わせる）
 * 大きなモチーフ：ON、機種：標準、補正率：0%、ブースト：100%
 */
export const DEFAULT_EQUIPMENT_SETTINGS: EquipmentSettings = {
  pipetteRate: 3.0,           // スポイト: 3個/秒
  mixerRate: 0.5,             // ミキサー: 1 × 0.5効率 = 0.5個/秒
  scissorsSec: 0.5,           // ハサミ: 0.5秒/個
  tutuRate: 1.0,              // チュチュハウス: 1個/秒
  albedoRate: 0.33,           // アルベド: 1 × 0.33効率 = 0.33個/秒
  inkBottleRate: 1.0,         // インク瓶メーカー: 1個/秒
  motifMakerRates: {
    circle: 1.0,              // モチーフメーカー: 大きなモチーフONで1.0個/秒
    square: 1.0,              // (baseCycleSec=2.0, bonus=2.0 → effectiveCycle=1.0)
    triangle: 1.0
  },
  scissorsPort2: false
}

/**
 * モチーフに必要な設備台数を計算
 */
export function calculateEquipmentForMotif(
  motifId: string,
  count: number,
  settings: EquipmentSettings,
  needsBottle: boolean = false
): EquipmentCount {
  const equipment: EquipmentCount = {}

  // インク系の処理
  if (motifId.startsWith('ink_')) {
    if (motifId === 'ink_white') {
      // 白インク: アルベドメーカー + (必要なら)インク瓶メーカー
      equipment.albedoMaker = Math.ceil(count / settings.albedoRate)
      if (needsBottle) {
        equipment.inkBottleMaker = Math.ceil(count / settings.inkBottleRate)
      }
    } else if (['ink_cyan', 'ink_magenta', 'ink_yellow'].includes(motifId)) {
      // 混色インク: ミキサー + (必要なら)インク瓶メーカー
      equipment.mixer = Math.ceil(count / settings.mixerRate)
      if (needsBottle) {
        equipment.inkBottleMaker = Math.ceil(count / settings.inkBottleRate)
      }
    } else {
      // 基本インク: スポイト + (必要なら)インク瓶メーカー
      equipment.pipette = Math.ceil(count / settings.pipetteRate)
      if (needsBottle) {
        equipment.inkBottleMaker = Math.ceil(count / settings.inkBottleRate)
      }
    }
  }

  // 図形モチーフの処理
  else if (['circle', 'square', 'triangle'].includes(motifId)) {
    const rate = settings.motifMakerRates[motifId as keyof typeof settings.motifMakerRates]
    equipment.motifMaker = Math.ceil(count / rate)
  }

  // 切断モチーフの処理
  else if (['rect', 'trapezoid', 'semicircle'].includes(motifId)) {
    // 元の図形のモチーフメーカー
    let baseMotif = motifId
    if (motifId === 'rect') baseMotif = 'square'
    else if (motifId === 'trapezoid') baseMotif = 'triangle'
    else if (motifId === 'semicircle') baseMotif = 'circle'

    const baseRate = settings.motifMakerRates[baseMotif as keyof typeof settings.motifMakerRates]
    let mmRate = baseRate

    // ハサミの出力ポート×2なら、必要モチーフメーカーは半分
    if (settings.scissorsPort2) {
      mmRate = mmRate * 2
    }

    equipment.motifMaker = Math.ceil(count / mmRate)
    equipment.scissors = Math.ceil(count * settings.scissorsSec)
  }

  // 特殊モチーフの処理
  else if (['star', 'heart'].includes(motifId)) {
    equipment.tutuHouse = Math.ceil(count / settings.tutuRate)
  }

  return equipment
}

/**
 * モチーフ要求を計算
 */
export function calculateMotifRequirement(
  motifId: string,
  count: number,
  needsBottle: boolean = false,
  settings: EquipmentSettings = DEFAULT_EQUIPMENT_SETTINGS
): MotifRequirement {
  return {
    count,
    equipment: calculateEquipmentForMotif(motifId, count, settings, needsBottle)
  }
}