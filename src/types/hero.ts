export type HeroRank = 'S' | 'A' | 'B' | 'C' | 'D'

export interface Hero {
  id: string
  name: string
  rank: HeroRank
  icon?: string
  outputPerCycle: number
  cycleSec: number
  recipe: Record<string, number>
}

export interface HeroData {
  heroes: Hero[]
  spells?: Hero[] // スペルマスター用
}