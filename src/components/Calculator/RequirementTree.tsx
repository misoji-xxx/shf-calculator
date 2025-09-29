'use client'

import { RequirementNode, MotifsData, EquipmentCount, Part } from '@/types/calculator'
import { Hero } from '@/types/hero'
import styles from './RequirementTree.module.css'

interface RequirementTreeProps {
  tree: RequirementNode | null
  motifs: MotifsData | null
  heroes: Hero[] | null
  spells: Hero[] | null
  parts: Part[] | null
  showMaterials: boolean
  onShowMaterialsChange: (checked: boolean) => void
}

function formatNumber(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1)
}

function getMotifIcon(motifId: string, motifs: MotifsData | null): string {
  if (!motifs || !motifs.icons[motifId]) {
    return '/img/icon.webp' // フォールバック
  }

  const iconPath = motifs.icons[motifId][0]
  return `/${iconPath}`
}

function getEntityIcon(entityId: string, heroes: Hero[] | null, spells: Hero[] | null, parts: Part[] | null): string {
  // ヒーローデータからアイコンパスを取得
  if (heroes) {
    const hero = heroes.find(h => h.id === entityId)
    if (hero && hero.icon) {
      return `/${hero.icon}`
    }
  }
  
  // スペルデータからアイコンパスを取得
  if (spells) {
    const spell = spells.find(s => s.id === entityId)
    if (spell && spell.icon) {
      return `/${spell.icon}`
    }
  }
  
  // パーツデータからアイコンパスを取得
  if (parts) {
    const part = parts.find(p => p.id === entityId)
    if (part && part.icon) {
      return `/${part.icon}`
    }
  }
  
  // フォールバック: 既存システムと同じ命名規則
  return `/img/${entityId}.webp`
}

function getCanvasIcon(): string {
  // 既存システムと同じキャンバスアイコン
  return '/img/icon_Canvas_Minion.webp'
}

function getEquipmentIcon(equipmentType: string): string {
  const iconMap: Record<string, string> = {
    motifMaker: '/img/icon_Drawmotif_Minion.webp',
    pipette: '/img/icon_UptakeInk_Minion.webp',
    mixer: '/img/icon_MixColor_Minion.webp',
    scissors: '/img/icon_Cutter_Minion.webp',
    tutuHouse: '/img/ChuChuHouse.webp',
    albedoMaker: '/img/icon_Albedo_Normal.webp',
    inkBottleMaker: '/img/icon_InkBottleProcessor_Minion.webp'
  }

  return iconMap[equipmentType] || '/img/icon.webp'
}

function renderEquipmentCounts(equipment: EquipmentCount): React.ReactNode {
  const equipmentEntries = Object.entries(equipment).filter(([_, count]) => count && count > 0)

  if (equipmentEntries.length === 0) {
    return null
  }

  return (
    <>
      {equipmentEntries.map(([type, count]) => (
        <span key={type} className={styles.equipmentPair}>
          <img
            src={getEquipmentIcon(type)}
            alt={type}
            className={styles.equipmentIcon}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/img/icon.webp'
            }}
          />
          <span className={styles.equipmentCount}>{count}</span>
        </span>
      ))}
    </>
  )
}

function collectUsedMotifs(node: RequirementNode): Set<string> {
  const used = new Set<string>()

  // 現在のノードのモチーフを追加
  Object.keys(node.motifs).forEach(key => {
    if (node.motifs[key].count > 0) {
      used.add(key)
    }
  })

  // 子ノードのモチーフを再帰的に追加
  node.children.forEach(child => {
    const childMotifs = collectUsedMotifs(child)
    childMotifs.forEach(motif => used.add(motif))
  })

  return used
}

function TreeRow({
  node,
  motifs,
  heroes,
  spells,
  parts,
  showMaterials,
  usedMotifs,
  depth = 0
}: {
  node: RequirementNode
  motifs: MotifsData | null
  heroes: Hero[] | null
  spells: Hero[] | null
  parts: Part[] | null
  showMaterials: boolean
  usedMotifs: string[]
  depth?: number
}) {
  return (
    <>
      <tr>
        {/* ヒーロー名 */}
        <td>
          <div className={styles.heroCell}>
            <span className={styles.indent} style={{ width: `${depth * 12}px` }} />
            <img
              src={getEntityIcon(node.id, heroes, spells, parts)}
              alt={node.name}
              className={styles.heroIcon}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/img/icon.webp'
              }}
            />
            <span>{node.name}</span>
          </div>
        </td>

        {/* キャンバス台数 */}
        <td className={styles.canvasCell}>
          <span>{node.canvasCount}</span>
        </td>

        {/* 各モチーフの列 */}
        {usedMotifs.map(motifId => (
          <td key={motifId}>
            {node.motifs[motifId] && node.motifs[motifId].count > 0 && (
              <div className={styles.motifCell}>
                {/* 1行目: 設備台数 */}
                <div className={styles.equipmentLine}>
                  {renderEquipmentCounts(node.motifs[motifId].equipment)}
                </div>

                {/* 2行目: 素材数量（材料表示ON時） */}
                {showMaterials && (
                  <div className={styles.materialLine}>
                    <img
                      src={getMotifIcon(motifId, motifs)}
                      alt={motifId}
                      className={styles.motifIcon}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/img/icon.webp'
                      }}
                    />
                    <span className={styles.motifCount}>
                      {formatNumber(node.motifs[motifId].count)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </td>
        ))}
      </tr>

      {/* 子ノード */}
      {node.children.map(child => (
        <TreeRow
          key={child.id}
          node={child}
          motifs={motifs}
          heroes={heroes}
          spells={spells}
          parts={parts}
          showMaterials={showMaterials}
          usedMotifs={usedMotifs}
          depth={depth + 1}
        />
      ))}
    </>
  )
}

export default function RequirementTree({
  tree,
  motifs,
  heroes,
  spells,
  parts,
  showMaterials,
  onShowMaterialsChange
}: RequirementTreeProps) {
  if (!tree) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          ヒーローを選択してください
        </div>
      </div>
    )
  }

  // 使用されているモチーフを収集し、motifs.jsonの順序でソート
  const usedMotifsSet = collectUsedMotifs(tree)
  const motifOrder = motifs ? Object.keys(motifs.icons) : []
  const usedMotifs = motifOrder.filter(motif => usedMotifsSet.has(motif))

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>必要生産数ツリー</h3>
        <div className={styles.controls}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={showMaterials}
              onChange={(e) => onShowMaterialsChange(e.target.checked)}
            />
            材料を表示
          </label>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.tree}>
          <thead>
            <tr>
              <th className={styles.heroHeader}>ヒーロー</th>
              <th className={styles.canvasHeader}>
                <img
                  src={getCanvasIcon()}
                  alt="キャンバス"
                  className={styles.headerIcon}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/img/icon.webp'
                  }}
                />
              </th>
              {usedMotifs.map(motifId => (
                <th key={motifId} className={styles.motifHeader}>
                  <img
                    src={getMotifIcon(motifId, motifs)}
                    alt={motifId}
                    className={styles.headerIcon}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/img/icon.webp'
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TreeRow
              node={tree}
              motifs={motifs}
              heroes={heroes}
              spells={spells}
              parts={parts}
              showMaterials={showMaterials}
              usedMotifs={usedMotifs}
            />
          </tbody>
        </table>
      </div>
    </div>
  )
}