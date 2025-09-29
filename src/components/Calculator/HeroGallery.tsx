'use client'

import { useState } from 'react'
import { Hero } from '@/types/hero'
import styles from './HeroGallery.module.css'

interface HeroGalleryProps {
  heroes: Hero[]
  spells: Hero[]
  selectedHero: string | null
  onHeroSelect: (heroId: string) => void
  loading?: boolean
}

// ランク別グルーピング（SとAは同グループ）
const getRankGroup = (rank: string): string => {
  if (rank === 'S' || rank === 'A') return 'S+A'
  return rank
}

const getRankOrder = (rank: string): number => {
  const order = { 'S+A': 0, 'B': 1, 'C': 2, 'D': 3 }
  return order[rank as keyof typeof order] ?? 999
}

// アイコン解決（SYSTEM_BEHAVIOR.mdの仕様に従う）
const resolveHeroIcon = (hero: Hero): string => {
  // JSONのiconを最優先
  if (hero.icon) {
    return `/${hero.icon}`
  }

  // idをPascalCaseに変換してimg/*.webpを試行
  const pascalCase = hero.id.charAt(0).toUpperCase() + hero.id.slice(1)
  return `/img/${pascalCase}.webp`
}

export default function HeroGallery({
  heroes,
  spells,
  selectedHero,
  onHeroSelect,
  loading = false
}: HeroGalleryProps) {
  // 展開/折りたたみ状態管理（デフォルトで全て展開）
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  if (loading) {
    return (
      <div className="settingRow">
        <label className="settingLabel">ヒーロー</label>
        <div className="settingOptions">
          <div>ヒーローデータを読み込み中...</div>
        </div>
      </div>
    )
  }

  // ランク別にグルーピング
  const groupedHeroes = heroes.reduce((groups, hero) => {
    const rankGroup = getRankGroup(hero.rank)
    if (!groups[rankGroup]) {
      groups[rankGroup] = []
    }
    groups[rankGroup].push(hero)
    return groups
  }, {} as Record<string, Hero[]>)

  // ランク順でソート
  const sortedRanks = Object.keys(groupedHeroes).sort((a, b) =>
    getRankOrder(a) - getRankOrder(b)
  )

  // 全グループを含むリスト（スペルも含む）
  const allGroups = [...sortedRanks]
  if (spells.length > 0) {
    allGroups.push('スペル')
  }

  // 初期化時にS+Aランクのみを展開状態にする
  if (Object.keys(openGroups).length === 0 && allGroups.length > 0) {
    const initialState = allGroups.reduce((acc, group) => {
      acc[group] = group === 'S+A'
      return acc
    }, {} as Record<string, boolean>)
    setOpenGroups(initialState)
  }

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  return (
    <div className="settingRow">
      <label className="settingLabel">ヒーロー</label>
      <div className="settingOptions">
        <div className={styles.heroGroups}>
          {/* ヒーローをランク別に表示 */}
          {sortedRanks.map(rankGroup => (
            <div
              key={rankGroup}
              className={styles.heroGroup}
            >
              <div
                className={styles.heroGroupHeader}
                onClick={() => toggleGroup(rankGroup)}
              >
                <div className={styles.heroGroupTitle}>
                  {rankGroup === 'S+A' ? 'A(+S) ランク' : `${rankGroup} ランク`}
                </div>
                <span className={styles.chev}>
                  {openGroups[rankGroup] ? '▼' : '▶'}
                </span>
              </div>
              <div className={openGroups[rankGroup] ? styles.heroGroupBody : styles.heroGroupBodyHidden}>
                <div className={styles.cardGrid}>
                  {groupedHeroes[rankGroup].map(hero => (
                    <button
                      key={hero.id}
                      className={`${styles.heroCard} ${selectedHero === hero.id ? 'selected' : ''
                        }`}
                      onClick={() => onHeroSelect(hero.id)}
                    >
                      <img
                        src={resolveHeroIcon(hero)}
                        alt={hero.name}
                        onError={(e) => {
                          // フォールバック処理
                          const target = e.target as HTMLImageElement
                          if (!target.src.includes('icon.webp')) {
                            target.src = '/img/icon.webp'
                          }
                        }}
                      />
                      <span className={styles.heroCardName}>{hero.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* スペルを別グループで表示（スペルマスター時のみ） */}
          {spells.length > 0 && (
            <div
              className={styles.heroGroup}
            >
              <div
                className={styles.heroGroupHeader}
                onClick={() => toggleGroup('スペル')}
              >
                <div className={styles.heroGroupTitle}>
                  スペル
                </div>
                <span className={styles.chev}>
                  {openGroups['スペル'] ? '▼' : '▶'}
                </span>
              </div>
              <div className={openGroups['スペル'] ? styles.heroGroupBody : styles.heroGroupBodyHidden}>
                <div className={styles.cardGrid}>
                  {spells.map(spell => (
                    <button
                      key={spell.id}
                      className={`${styles.heroCard} ${selectedHero === spell.id ? 'selected' : ''
                        }`}
                      onClick={() => onHeroSelect(spell.id)}
                    >
                      <img
                        src={resolveHeroIcon(spell)}
                        alt={spell.name}
                        onError={(e) => {
                          // フォールバック処理
                          const target = e.target as HTMLImageElement
                          if (!target.src.includes('icon.webp')) {
                            target.src = '/img/icon.webp'
                          }
                        }}
                      />
                      <span className={styles.heroCardName}>{spell.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}