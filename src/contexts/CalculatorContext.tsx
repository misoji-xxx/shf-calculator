'use client'

import { createContext, useContext, ReactNode } from 'react'
import { MasterType } from '@/components/Calculator/MasterTypeSelector'
import { EquipmentTierSettings, MotifProductionBoosts, EquipmentCoefficients, EquipmentOptions, CalculationOptions } from '@/types/calculator'

interface CalculatorContextType {
  selectedMaster: MasterType
  equipmentTiers: EquipmentTierSettings
  targetRate: number
  showMaterials: boolean
  motifBoosts: MotifProductionBoosts
  equipmentCoefficients: EquipmentCoefficients
  equipmentOptions: EquipmentOptions
  calculationOptions: CalculationOptions
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined)

interface CalculatorProviderProps {
  children: ReactNode
  value: CalculatorContextType
}

export function CalculatorProvider({ children, value }: CalculatorProviderProps) {
  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  )
}

export function useCalculatorContext() {
  const context = useContext(CalculatorContext)
  if (context === undefined) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider')
  }
  return context
}