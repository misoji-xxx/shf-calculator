'use client'

import styles from './PageDisclaimer.module.css'

export default function PageDisclaimer() {
  return (
    <div className={styles.disclaimer}>
      <div className={styles.content}>
        本ツールは非公式です。公式サポートへのお問い合わせはご遠慮ください。<br />
        本ページで使用している画像の権利は株式会社アソビズムに帰属します。<br />
        掲載している情報および計算結果には誤りが含まれる可能性があります。正確性・完全性は保証しかねます。<br />
        お問い合わせは<a href="https://misoji-xxx.github.io/shf-calculator/" target="_blank" rel="noopener noreferrer">GitHub</a>までご連絡ください。<br />
      </div>
      <div className={styles.version}>
        v1.0.0 / Supported v1.05
      </div>
    </div>
  )
}