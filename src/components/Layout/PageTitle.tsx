import Image from 'next/image'
import { withBasePath } from '@/lib/path'
import styles from './PageTitle.module.css'

export default function PageTitle() {
    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <Image
                    src={withBasePath('/img/icon.webp')}
                    alt="ShapeHero Factory"
                    width={40}
                    height={40}
                    className={styles.icon}
                />
                <h1 className={styles.title}>ShapeHero Factory Calculator</h1>
            </div>
            <p className={styles.description}>
                <a href="https://www.asobism.co.jp/shapeherofactory/ja/" target="_blank" rel="noopener noreferrer">
                    ShapeHero Factory
                </a>
                の計算ツールです。目標生産速度と設備性能から必要設備台数を計算します。
            </p>
        </div>
    )
}