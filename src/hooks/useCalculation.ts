'use client'

import { useMemo } from 'react'
import { Hero } from '@/types/hero'
import { EquipmentData, Part, RequirementNode } from '@/types/calculator'
import { buildRequirementTree } from '@/lib/calculator/calculations'

export function useCalculation(
  selectedHero: Hero | null,
  targetRate: number,
  equipments: EquipmentData | null,
  heroes: Hero[],
  spells: Hero[],
  parts: Part[],
  tierSettings?: import('@/types/calculator').EquipmentTierSettings,
  spellGeneratorOptions?: import('@/types/calculator').SpellGeneratorOptions,
  motifBoosts?: import('@/types/calculator').MotifProductionBoosts,
  equipmentCoefficients?: import('@/types/calculator').EquipmentCoefficients,
  equipmentOptions?: import('@/types/calculator').EquipmentOptions,
  calculationOptions?: import('@/types/calculator').CalculationOptions
) {
  const calculationResult = useMemo(() => {
    if (!selectedHero || !equipments) {
      return null
    }

    // ヒーローとパーツのマップを作成
    const heroesById: Record<string, Hero> = {}
    heroes.forEach(h => heroesById[h.id] = h)
    
    const spellsById: Record<string, Hero> = {}
    spells.forEach(s => {
      spellsById[s.id] = s
      heroesById[s.id] = s // heroesById にも追加（検索用）
    })
    
    const partsById: Record<string, Part> = {}
    parts.forEach(p => partsById[p.id] = p)

    try {
      const tree = buildRequirementTree(
        selectedHero,
        targetRate,
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
      
      return tree
    } catch (error) {
      console.error('Calculation error:', error)
      return null
    }
  }, [selectedHero, targetRate, equipments, heroes, spells, parts, tierSettings, spellGeneratorOptions, motifBoosts, equipmentCoefficients, equipmentOptions, calculationOptions])

  return calculationResult
}