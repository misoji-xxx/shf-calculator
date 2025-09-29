'use client'

import Image from 'next/image'
import { withBasePath } from '@/lib/path'
import styles from './MasterTypeSelector.module.css'

export type MasterType = 'minion' | 'spell'

interface MasterTypeSelectorProps {
  selectedMaster: MasterType
  onMasterChange: (master: MasterType) => void
}

export default function MasterTypeSelector({
  selectedMaster,
  onMasterChange
}: MasterTypeSelectorProps) {
  return (
    <div className="settingRow">
      <label className="settingLabel">マスター</label>
      <div className={`settingOptions ${styles.tabs}`}>
        <div
          className={`${styles.tab} ${selectedMaster === 'minion' ? styles.active : ''}`}
          onClick={() => onMasterChange('minion')}
        >
          <Image
            src={withBasePath('/img/icon_author_MinionMaster_2.webp')}
            alt="ミニオンマスター"
            width={28}
            height={28}
            className={styles.icon}
          />
          <span className={styles.name}>ミニオンマスター</span>
        </div>

        <div
          className={`${styles.tab} ${selectedMaster === 'spell' ? styles.active : ''}`}
          onClick={() => onMasterChange('spell')}
        >
          <Image
            src={withBasePath('/img/icon_author_Fairy_2.webp')}
            alt="スペルマスター"
            width={28}
            height={28}
            className={styles.icon}
          />
          <span className={styles.name}>スペルマスター</span>
        </div>
      </div>
    </div>
  )
}