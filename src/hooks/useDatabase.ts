'use client'

import { useState, useEffect } from 'react'
import { Hero, HeroData } from '@/types/hero'
import { EquipmentData, PartsData, MotifsData, Part } from '@/types/calculator'
import { MasterType } from '@/components/Calculator/MasterTypeSelector'

export function useDatabase() {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [spells, setSpells] = useState<Hero[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [equipments, setEquipments] = useState<EquipmentData | null>(null)
  const [motifs, setMotifs] = useState<MotifsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // 並行してすべてのデータを読み込み
      const [partsRes, equipmentsRes, motifsRes] = await Promise.all([
        fetch('/data/parts.json'),
        fetch('/data/equipments.json'),
        fetch('/data/motifs.json')
      ])

      if (!partsRes.ok || !equipmentsRes.ok || !motifsRes.ok) {
        throw new Error('Failed to load data files')
      }

      const [partsData, equipmentsData, motifsData] = await Promise.all([
        partsRes.json() as Promise<PartsData>,
        equipmentsRes.json() as Promise<EquipmentData>,
        motifsRes.json() as Promise<MotifsData>
      ])

      setParts(partsData.parts)
      setEquipments(equipmentsData)
      setMotifs(motifsData)
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    }
  }

  const loadHeroes = async (masterType: MasterType) => {
    try {
      const filename = masterType === 'minion' ? 'heroes_minion.json' : 'heroes_spell.json'
      const response = await fetch(`/data/${filename}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`)
      }
      
      const data: HeroData = await response.json()
      
      setHeroes(data.heroes)
      
      // スペルマスターの場合のみspellsを設定
      if (masterType === 'spell' && data.spells) {
        setSpells(data.spells)
      } else {
        setSpells([])
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setHeroes([])
      setSpells([])
    } finally {
      setLoading(false)
    }
  }

  // 初回読み込み時に全データを読み込み
  useEffect(() => {
    loadAllData()
  }, [])

  return {
    heroes,
    spells,
    parts,
    equipments,
    motifs,
    loading,
    error,
    loadHeroes
  }
}