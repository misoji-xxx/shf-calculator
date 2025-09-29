'use client'

import { MotifProductionBoosts as MotifBoosts } from '@/types/calculator'
import styles from './MotifProductionBoosts.module.css'

interface MotifProductionBoostsProps {
  motifBoosts: MotifBoosts
  onMotifBoostChange: (motifType: keyof MotifBoosts, boost: number) => void
}

const BOOST_OPTIONS = [100, 125, 150, 175, 200, 225, 250, 275, 300]

const MOTIF_CONFIG = {
  circle: { label: '円', icon: '/img/circle.webp' },
  square: { label: '四角', icon: '/img/square.webp' },
  triangle: { label: '三角', icon: '/img/triangle.webp' }
} as const

export default function MotifProductionBoosts({ motifBoosts, onMotifBoostChange }: MotifProductionBoostsProps) {
  return (
    <div className="settingRow">
      <label className="settingLabel">モチーフ生産率</label>
      <div className="settingOptions">
        <div className={styles.motifBoosts}>
          {(Object.keys(MOTIF_CONFIG) as Array<keyof MotifBoosts>).map((motifType) => (
            <div key={motifType} className={styles.motifBoostsItem}>
              <img 
                src={MOTIF_CONFIG[motifType].icon} 
                alt={motifType}
                className={styles.motifBoostsIcon}
              />
              <select
                className={styles.motifBoostsSelect}
                value={motifBoosts[motifType]}
                onChange={(e) => onMotifBoostChange(motifType, parseInt(e.target.value))}
              >
                {BOOST_OPTIONS.map((boost) => (
                  <option key={boost} value={boost}>
                    {boost}%
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}