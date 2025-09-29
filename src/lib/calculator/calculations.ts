import { Hero } from '@/types/hero'
import { EquipmentData, Part, RequirementNode } from '@/types/calculator'
import { calculateMotifRequirement, calculateEquipmentForMotif, buildEquipmentSettings, DEFAULT_EQUIPMENT_SETTINGS } from './equipment'

/**
 * モチーフ（終端素材）かどうかを判定
 */
export function isMotif(key: string): boolean {
  const shapeMotifs = new Set(['circle', 'triangle', 'square', 'rect', 'trapezoid', 'semicircle', 'star', 'heart'])
  return shapeMotifs.has(key) || key.startsWith('ink_') || key.startsWith('inkbottle_')
}

/**
 * ヒーロー/スペルの1台あたりの生産速度を計算
 */
export function getHeroPerCanvasPerSec(
  equipments: EquipmentData, 
  hero: Hero | Part,
  tierSettings?: import('@/types/calculator').EquipmentTierSettings,
  equipmentCoefficients?: import('@/types/calculator').EquipmentCoefficients,
  isSpell: boolean = false
): number {
  // 既存システムに合わせてbaseCanvasSecは1に正規化
  const baseCanvasSec = 1

  const recipe = hero.recipe || {}

  if (isSpell) {
    // スペルの場合はスペルジェネレーターを使用
    const spellGeneratorBaseMul = tierSettings?.spellGenerator
      ? equipments.spellGenerator?.tiers?.[tierSettings.spellGenerator]?.cycleSec ?? 1
      : 1

    // スペルジェネレーターには補正率を適用しない
    const spellGeneratorMul = spellGeneratorBaseMul

    const baseCycleSec = Math.max(baseCanvasSec, hero.cycleSec)
    const output = hero.outputPerCycle || 1
    const basePerSec = output / baseCycleSec

    return basePerSec * Math.max(1, spellGeneratorMul)
  } else {
    // ヒーローの場合はキャンバス/複合キャンバスを使用
    // 素材の種類数で複合キャンバス使用を判定（正しい仕様）
    const materialTypeCount = Object.keys(recipe).length
    const useComposite = materialTypeCount >= 3

    // 性能設定に基づいて速度倍率を取得
    const canvasBaseMul = tierSettings?.canvas
      ? equipments.canvas?.tiers?.[tierSettings.canvas]?.cycleSec ?? 1
      : 1

    const compositeBaseMul = tierSettings?.compositeCanvas
      ? equipments.compositeCanvas?.tiers?.[tierSettings.compositeCanvas]?.cycleSec ?? 1
      : 1

    // 補正率を適用した最終倍率を計算
    const coefCanvasPct = equipmentCoefficients?.canvas ?? 0
    const canvasMul = canvasBaseMul * (1 + Math.max(0, coefCanvasPct) / 100)
    const compositeMul = compositeBaseMul * (1 + Math.max(0, coefCanvasPct) / 100)

    // 使用するキャンバスに応じて計算
    const chosenCanvasSec = baseCanvasSec // 常に1
    const baseCycleSec = Math.max(chosenCanvasSec, hero.cycleSec)
    const output = hero.outputPerCycle || 1
    const basePerSec = output / baseCycleSec

    // 機種による速度倍率を適用
    const multiplier = useComposite ? compositeMul : canvasMul

    return basePerSec * Math.max(1, multiplier)
  }
}

/**
 * 混色インクの原色展開
 * 効率50%時: perSourceRate = 目標レート / (0.5 × 2) = 目標レート × 1.0
 */
function expandCompositeInk(inkId: string, rate: number, mixerEfficiency: number = 0.5): Record<string, number> | null {
  const expansions: Record<string, string[]> = {
    'ink_cyan': ['ink_blue', 'ink_green'],
    'ink_magenta': ['ink_red', 'ink_blue'], 
    'ink_yellow': ['ink_red', 'ink_green']
  }
  
  if (expansions[inkId]) {
    const result: Record<string, number> = {}
    const inputColorCount = 2 // 入力色数は常に2
    const perSourceRate = rate / (mixerEfficiency * inputColorCount)
    
    expansions[inkId].forEach(baseInk => {
      result[baseInk] = perSourceRate // 効率50%時は各色1.0個ずつ
    })
    return result
  }
  
  return null
}

/**
 * 白インクの原色展開
 * 効率33%時: perSourceRate = 目標レート / (0.33 × 3) = 目標レート × 1.0
 */
function expandWhiteInk(rate: number, albedoEfficiency: number = 0.33): Record<string, number> {
  const inputColorCount = 3 // 入力色数は3（赤・緑・青）
  const perSourceRate = rate / (albedoEfficiency * inputColorCount)
  
  return {
    'ink_red': perSourceRate,
    'ink_green': perSourceRate,
    'ink_blue': perSourceRate
  }
}

/**
 * 特殊モチーフ（星・ハート）の対応パーツを取得
 */
function getSpecialMotifSourcePart(motifKey: string): string | null {
  const mapping: Record<string, string> = { 
    star: 'hammer', 
    heart: 'cheese' 
  }
  return mapping[motifKey] || null
}

/**
 * 要求ツリーを構築（簡易版）
 */
export function buildRequirementTree(
  hero: Hero | Part,
  targetRate: number,
  equipments: EquipmentData,
  heroesById: Record<string, Hero>,
  partsById: Record<string, Part>,
  tierSettings?: import('@/types/calculator').EquipmentTierSettings,
  spellsById?: Record<string, Hero>,
  spellGeneratorOptions?: import('@/types/calculator').SpellGeneratorOptions,
  motifBoosts?: import('@/types/calculator').MotifProductionBoosts,
  equipmentCoefficients?: import('@/types/calculator').EquipmentCoefficients,
  equipmentOptions?: import('@/types/calculator').EquipmentOptions,
  calculationOptions?: import('@/types/calculator').CalculationOptions
): RequirementNode {
  // スペルかどうかを判定（spellsByIdに含まれているかで判定）
  const isSpell = spellsById ? !!spellsById[hero.id] : false
  
  // スペルジェネレーターオプションが有効な場合、スペルの生産数が2倍になる
  const spellProductionMultiplier = (isSpell && spellGeneratorOptions?.tripleInkBottleConsumption) ? 2 : 1
  
  const perCanvasPerSec = getHeroPerCanvasPerSec(equipments, hero, tierSettings, equipmentCoefficients, isSpell)
  const effectivePerCanvasPerSec = perCanvasPerSec * spellProductionMultiplier
  const canvasCount = Math.ceil(targetRate / effectivePerCanvasPerSec)
  
  // 性能設定に基づいて設備設定を構築
  const equipmentSettings = buildEquipmentSettings(equipments, tierSettings, motifBoosts, equipmentCoefficients, equipmentOptions, calculationOptions)
  
  const node: RequirementNode = {
    id: hero.id,
    name: hero.name,
    requiredRate: targetRate,
    canvasCount,
    motifs: {},
    children: []
  }

  // インク瓶が必要な素材を追跡
  const bottleRequired: Record<string, boolean> = {}

  // レシピを展開
  const recipe = hero.recipe || {}
  for (const [materialId, count] of Object.entries(recipe)) {
    let materialRate = targetRate * count

    // インク瓶が必要かどうかを判定
    const normalizedKey = materialId.startsWith('inkbottle_') 
      ? materialId.replace('inkbottle_', 'ink_')
      : materialId
    
    if (materialId.startsWith('inkbottle_')) {
      bottleRequired[normalizedKey] = true
      
      // スペルジェネレーターオプションが有効な場合、インク瓶の実効消費効率を適用
      // 生産数2倍、消費3倍 → スペル1個あたり1.5倍の消費効率
      if (isSpell && spellGeneratorOptions?.tripleInkBottleConsumption) {
        materialRate = materialRate * (3 / 2) // 3倍消費 ÷ 2倍生産 = 1.5倍
      }
    }

    if (isMotif(normalizedKey)) {
      // 終端素材（モチーフ）- 設備台数も計算
      const needsBottle = bottleRequired[normalizedKey] || false
      node.motifs[normalizedKey] = calculateMotifRequirement(normalizedKey, materialRate, needsBottle, equipmentSettings)

      // 特殊モチーフ（星・ハート）の場合、対応パーツを経由
      const sourcePart = getSpecialMotifSourcePart(normalizedKey)
      if (sourcePart) {
        const tutuUnitRate = equipmentSettings.tutuRate
        const adjustedRate = materialRate / tutuUnitRate
        const partEntity = partsById[sourcePart]
        if (partEntity) {
          const childNode = buildRequirementTree(
            partEntity,
            adjustedRate,
            equipments,
            heroesById,
            partsById,
            tierSettings,
            spellsById,
            spellGeneratorOptions,
            motifBoosts,
            equipmentCoefficients,
            equipmentOptions,
            calculationOptions
          )
          node.children.push(childNode)
        }
      }

      // 混色インクの原色展開
      if (['ink_cyan', 'ink_magenta', 'ink_yellow'].includes(normalizedKey)) {
        const mixerEfficiency = (equipmentCoefficients?.mixerEfficiency ?? 50) / 100
        const expansion = expandCompositeInk(normalizedKey, materialRate, mixerEfficiency)
        if (expansion) {
          for (const [baseInk, expandedRate] of Object.entries(expansion)) {
            if (!node.motifs[baseInk]) {
              node.motifs[baseInk] = calculateMotifRequirement(baseInk, 0, false)
            }
            node.motifs[baseInk].count += expandedRate
            node.motifs[baseInk].equipment = calculateEquipmentForMotif(
              baseInk, 
              node.motifs[baseInk].count, 
              equipmentSettings, 
              false
            )
          }
        }
      }

      // 白インクの原色展開
      if (normalizedKey === 'ink_white') {
        const albedoEfficiency = (equipmentCoefficients?.albedoEfficiency ?? 33) / 100
        const expansion = expandWhiteInk(materialRate, albedoEfficiency)
        for (const [baseInk, expandedRate] of Object.entries(expansion)) {
          if (!node.motifs[baseInk]) {
            node.motifs[baseInk] = calculateMotifRequirement(baseInk, 0, false)
          }
          node.motifs[baseInk].count += expandedRate
          node.motifs[baseInk].equipment = calculateEquipmentForMotif(
            baseInk, 
            node.motifs[baseInk].count, 
            equipmentSettings, 
            false
          )
        }
      }
    } else {
      // 中間素材（パーツやヒーロー/スペル）
      const materialEntity = partsById[materialId] || heroesById[materialId] || (spellsById ? spellsById[materialId] : null)
      if (materialEntity) {
        const childNode = buildRequirementTree(
          materialEntity,
          materialRate,
          equipments,
          heroesById,
          partsById,
          tierSettings,
          spellsById,
          spellGeneratorOptions,
          motifBoosts,
          equipmentCoefficients,
          equipmentOptions,
          calculationOptions
        )
        node.children.push(childNode)
      }
    }
  }

  return node
}