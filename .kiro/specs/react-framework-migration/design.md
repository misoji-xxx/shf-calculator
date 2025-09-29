# 設計書

## 概要

ShapeHero Factory CalculatorはNext.jsベースのReactアプリケーションとして構築されており、SSG（Static Site Generation）で静的サイトとして配信される。保守可能で理解しやすいReactコンポーネント構造により、継続的な機能拡張と品質向上を実現する。

## システム構成

**技術スタック**: Next.js 14、TypeScript、CSS Modules、React Context APIによる現代的なWebアプリケーション構成で、高いパフォーマンスと開発効率を両立している。

## 詳細計算仕様（実装済み）

### デフォルト設定値
- **大きなモチーフ**: ON（デフォルト）
- **機種**: 標準（base）
- **補正率**: 0%
- **ブースト**: 100%
- **その他オプション**: デフォルト

### 設備の実効レート（デフォルト時）
- **モチーフメーカー**: 1.0個/秒（大きなモチーフONで2.0秒→1.0秒）
- **スポイト**: 3.0個/秒
- **ミキサー**: 0.5個/秒（baseRate 1.0 × 効率50%）
- **アルベドメーカー**: 0.33個/秒（baseRate 1.0 × 効率33%）
- **ハサミ**: 0.5秒/個
- **チュチュハウス**: 1.0個/秒
- **インク瓶メーカー**: 1.0個/秒

### 混色インクの計算ロジック
**ミキサー効率**: 混色の歩留まり/転換効率として機能
- 入力側: 必要原色量を増やす補正率
- 出力側: ミキサー実効生産レートを下げる補正率

**計算式**:
```
原色必要量（各色）= 目標混色レート / (効率 × 入力色数)
ミキサー実効出力 = baseRate × 効率
```

**デフォルト（効率50%）での比率**:
- `ink_yellow`: 赤1.0 + 緑1.0 → 黄1.0
- `ink_cyan`: 青1.0 + 緑1.0 → シアン1.0  
- `ink_magenta`: 赤1.0 + 青1.0 → マゼンタ1.0

### 白インクの計算ロジック
**アルベドメーカー効率**: 33%（デフォルト）

**計算式**:
```
原色必要量（各色）= 目標白インクレート / (効率 × 3)
```

**デフォルト（効率33%）での比率**:
- `ink_white`: 赤1.0 + 緑1.0 + 青1.0 → 白1.0

### 特殊モチーフの処理
- **星（star）**: ハンマー（hammer）をチュチュハウス経由で生産
- **ハート（heart）**: チーズ（cheese）をチュチュハウス経由で生産

### インク瓶メーカーの条件
- レシピで`inkbottle_*`を使用する場合のみ表示
- 通常の`ink_*`使用時は表示されない

## 設備性能選択機能（実装済み）

### 設備性能仕様
各設備には3段階の性能が存在し、性能に応じて生産効率が向上する：

#### 性能別倍率
- **標準（base）**: 1.0倍（基本性能）
- **高性能（high）**: 1.5倍
- **最上位（top）**: 3.0倍

#### 対象設備
1. **キャンバス**: ヒーロー生産用（素材2種類以下）
2. **複合キャンバス**: ヒーロー生産用（素材3種類以上）
3. **モチーフメーカー**: モチーフ生産用
4. **スポイト**: インク生産用
5. **スペルジェネレーター**: スペル生産用（スペルマスター専用）

### キャンバス使い分けロジック
```typescript
// 素材の種類数で判定（個数ではない）
const materialTypeCount = Object.keys(recipe).length
const useComposite = materialTypeCount >= 3
```

### 計算式
#### 基本計算式
```typescript
// 性能倍率の適用
const tierMultiplier = equipments[equipmentType].tiers[selectedTier].cycleSec
const coefficientMultiplier = 1 + (coefficientPercent / 100)
const finalMultiplier = tierMultiplier * coefficientMultiplier

// 1台あたりの生産速度
const perUnitPerSec = (outputPerCycle / max(1, cycleSec)) * finalMultiplier

// 必要台数
const requiredUnits = ceil(targetRate / perUnitPerSec)
```

#### スペル生産の特殊処理
```typescript
// スペルかどうかの判定
const isSpell = spellsById[hero.id] !== undefined

// スペルの場合はスペルジェネレーターを使用
if (isSpell) {
  const spellGeneratorMultiplier = tierSettings.spellGenerator倍率
  // スペルジェネレーター用の計算
}
```

### スペルジェネレーター特殊オプション
#### インク瓶3倍消費でスペル生産数2倍機能
- **UI**: スペルジェネレーターセクションにチェックボックス表示
- **表示条件**: スペルマスター選択時のみ
- **効果**: 
  - スペルの生産数が1個/サイクル → 2個/サイクル
  - インク瓶系素材（`inkbottle_*`）の消費量が3倍
  - **実効消費効率**: スペル1個あたり1.5倍のインク瓶消費

#### 計算ロジック
```typescript
// スペル生産数倍率
const spellProductionMultiplier = tripleInkBottleOption ? 2 : 1
const effectivePerUnitPerSec = basePerUnitPerSec * spellProductionMultiplier

// インク瓶消費効率（3倍消費 ÷ 2倍生産 = 1.5倍）
if (materialId.startsWith('inkbottle_') && tripleInkBottleOption) {
  materialRate = materialRate * (3 / 2)
}
```

## モチーフ生産率設定機能（実装済み）

### 機能概要
円・四角・三角の各モチーフタイプに対して個別の生産率ブースト設定を提供し、既存システムと同じ計算ロジックでモチーフメーカーの実効レートに反映する。

### UI仕様
#### MotifProductionBoostsコンポーネント
- **表示位置**: EquipmentTierPanelの下部
- **レイアウト**: 
  - デスクトップ: 3つのモチーフを横並びで表示
  - モバイル: 縦積みレイアウト
- **各モチーフ項目**:
  - モチーフアイコン（32x32px）
  - ブースト率選択セレクトボックス

#### ブースト設定仕様
- **選択肢**: 100%, 125%, 150%, 175%, 200%, 225%, 250%, 275%, 300%（25%刻み）
- **デフォルト値**: 全モチーフ100%
- **対象モチーフ**:
  - 円モチーフ（circle）: `/img/circle.webp`
  - 四角モチーフ（square）: `/img/square.webp`
  - 三角モチーフ（triangle）: `/img/triangle.webp`

### 計算ロジック仕様
#### 基本計算式（既存システムと同じ）
```typescript
// 基本モチーフメーカーレート計算
const baseSec = equipments.motifMaker.baseCycleSec || 2.0
const bigBonusOn = true // 大きなモチーフボーナス（デフォルトON）
const bonus = bigBonusOn ? (equipments.motifMaker.bonus || 2) : 1
const tierSec = equipments.motifMaker.tiers[selectedTier].cycleSec || baseSec
const effectiveCycle = tierSec / Math.max(1e-6, bonus)
const baseRate = (1 / Math.max(1e-6, effectiveCycle)) * (1 + coefficientPercent/100)

// 各モチーフの実効レート
const motifMakerRates = {
  circle: baseRate * (circleBoost / 100),
  square: baseRate * (squareBoost / 100),
  triangle: baseRate * (triangleBoost / 100)
}
```

#### 計算反映箇所
1. **buildEquipmentSettings関数**: 性能設定とブースト設定を統合
2. **モチーフ必要台数計算**: 各モチーフタイプの実効レートを使用
3. **切断モチーフ計算**: 元モチーフのブースト設定を継承

#### 型定義
```typescript
interface MotifProductionBoosts {
  circle: number    // 円モチーフのブースト率 (100-300%)
  square: number    // 四角モチーフのブースト率 (100-300%)
  triangle: number  // 三角モチーフのブースト率 (100-300%)
}
```

### 状態管理
- **CalculatorContext**: モチーフブースト設定を全体状態として管理
- **CalculatorApp**: ブースト設定の変更ハンドラーを実装
- **useCalculation**: 計算時にブースト設定を計算ロジックに渡す

### UI実装詳細
#### EquipmentTierPanelコンポーネント
- **レスポンシブデザイン**: モバイル対応レイアウト
- **マスタータイプ連動**: スペルジェネレーターはスペルマスター時のみ表示
- **状態管理**: CalculatorContextで全体状態を共有

#### 表示制御
```typescript
// スペルマスター専用UI制御
const showSpellGenerator = masterType === 'spell'
const showSpellGeneratorOptions = masterType === 'spell' && equipmentType === 'spellGenerator'
```

## 設備補正率設定機能（実装済み）

### 機能概要
各設備に対して個別の補正率を設定し、既存システムと同じ計算ロジックで設備の実効レートに反映する。設備ごとに異なる補正率選択肢と計算式を提供。

### UI仕様
#### EquipmentUpgradeGridコンポーネント
- **表示位置**: MotifProductionBoostsの下部
- **レイアウト**: 
  - デスクトップ: 3列グリッドレイアウト
  - タブレット: 2列グリッドレイアウト
  - モバイル: 縦積みレイアウト
- **各設備項目**:
  - 設備アイコン（性能連動で動的更新）
  - 補正率選択セレクトボックス
  - 特殊オプション（ハサミ出力ポート×2等）

### 設備別補正率仕様

#### 1. キャンバス補正率
- **選択肢**: 0%〜130%（5%刻み）
- **適用対象**: キャンバス・複合キャンバス
- **計算式**: `実効倍率 = 基本倍率 × (1 + 補正率%/100)`
- **効果**: ヒーロー生産速度向上

#### 2. モチーフメーカー補正率
- **選択肢**: 0%〜130%（5%刻み）
- **適用対象**: モチーフメーカー
- **計算式**: `実効レート = 基本レート × (1 + 補正率%/100)`
- **効果**: モチーフ生産速度向上

#### 3. スポイト補正率
- **選択肢**: 0%〜130%（5%刻み）
- **適用対象**: スポイト
- **計算式**: `実効レート = 基本レート × (1 + 補正率%/100)`
- **効果**: 基本インク生産速度向上

#### 4. ハサミ補正率
- **選択肢**: 0%, 30%, 50%, 80%, 130%
- **適用対象**: ハサミ（切断系モチーフのみ）
- **計算式**: `実効サイクル時間 = 基本サイクル時間 / ((1 + 補正率%/100) × ポート倍率)`
- **特殊オプション**: 出力ポート×2
  - ハサミ効率2倍
  - 必要モチーフメーカー台数半分
- **効果**: 切断モチーフ（rect, trapezoid, semicircle）生産効率向上

#### 5. ミキサー補正率
- **速度補正率**: 0%, 50%, 100%
- **効率**: 50%, 60%, 80%, 90%, 100%, 130%
- **適用対象**: ミキサー（混色インク）
- **計算式**: `実効レート = 基本レート × (1 + 速度補正率%/100) × (効率%/100)`
- **原色必要量**: `必要量 = 目標レート / (効率 × 入力色数)`
- **効果**: 混色インク（cyan, magenta, yellow）生産効率向上

#### 6. アルベドメーカー補正率（スペルマスター専用）
- **速度補正率**: 0%, 50%, 100%
- **効率**: 33%, 66%, 100%
- **適用対象**: アルベドメーカー（白インク）
- **計算式**: `実効レート = 基本レート × (1 + 速度補正率%/100) × (効率%/100)`
- **原色必要量**: `必要量 = 目標レート / (効率 × 3)`
- **効果**: 白インク生産効率向上

### 計算ロジック統合

#### 補正率適用の流れ
1. **buildEquipmentSettings関数**: 各設備の補正率を統合して実効レートを計算
2. **設備台数計算**: 実効レートを使用して必要台数を算出
3. **原色必要量計算**: 効率設定を使用して原色消費量を算出
4. **再帰計算**: 子ノードでも同じ補正率設定を適用

#### 型定義
```typescript
interface EquipmentCoefficients {
  canvas: number        // キャンバス補正率 (0-130%)
  motifMaker: number    // モチーフメーカー補正率 (0-130%)
  pipette: number       // スポイト補正率 (0-130%)
  mixer: number         // ミキサー速度補正率 (0-100%)
  mixerEfficiency: number // ミキサー効率 (50-130%)
  scissors: number      // ハサミ補正率 (0-130%)
  albedo: number        // アルベドメーカー速度補正率 (0-100%)
  albedoEfficiency: number // アルベドメーカー効率 (33-100%)
}

interface EquipmentOptions {
  scissorsPort2: boolean    // ハサミ出力ポート×2
  tutuPort2: boolean       // チュチュハウス出力ポート×2
}
```

### 状態管理
- **CalculatorContext**: 設備補正率設定を全体状態として管理
- **CalculatorApp**: 補正率設定の変更ハンドラーを実装
- **useCalculation**: 計算時に補正率設定を計算ロジックに渡す
- **動的アイコン取得**: equipments.jsonから設備アイコンを動的取得

## 計算オプション機能（実装済み）

### 機能概要
計算に影響する基本的なオプション設定を提供し、既存システムと同じ計算ロジックで各設備の動作を制御する。モチーフメーカーのボーナス設定とチュチュハウスの生産レート設定が可能。

### UI仕様
#### CalculationOptionsコンポーネント
- **表示位置**: EquipmentUpgradeGridの下部
- **レイアウト**: 
  - デスクトップ: 2列グリッドレイアウト
  - モバイル: 縦積みレイアウト
- **各オプション項目**:
  - チェックボックス形式
  - 説明テキスト付き

### オプション仕様

#### 1. 大きなモチーフで生産量を計算する(+100%)
- **デフォルト値**: ON（既存システムと同じ）
- **適用対象**: 全モチーフ（円・四角・三角）
- **計算式**: 
  - ON時: `effectiveBonus = motifBonus`（通常2.0倍）
  - OFF時: `effectiveBonus = 1.0`（ボーナス無効）
- **効果**: モチーフメーカーの実効サイクル時間が変化
  - ON時: 2.0秒 → 1.0秒（2倍効率）
  - OFF時: 2.0秒のまま（標準効率）

#### 2. チュチュハウスの生産量を2/1sで計算する
- **デフォルト値**: ON（既存システムと同じ）
- **適用対象**: 星・ハートモチーフ（ハンマー・チーズ経由）
- **計算式**:
  - ON時: `tutuRate = baseRate × 2`（2個/秒）
  - OFF時: `tutuRate = baseRate × 1`（1個/秒）
- **効果**: 特殊モチーフの生産効率が変化
  - ハンマー・チーズの必要量が半分/2倍
  - チュチュハウスの必要台数が半分/2倍

### 計算ロジック統合

#### 大きなモチーフボーナスの適用
```typescript
// モチーフメーカーのボーナス計算
const bigMotifBonusOn = calculationOptions?.bigMotifBonus ?? true
const effectiveBonus = bigMotifBonusOn ? motifBonus : 1
const baseMotifRate = (1 / motifMakerCycleSec * effectiveBonus) * coefficientMultiplier
```

#### チュチュハウス設定の適用
```typescript
// チュチュハウスレート計算
const tutuPort2 = calculationOptions?.tutuPort2 ?? true
const tutuRate = tutuBaseRate * (tutuPort2 ? 2 : 1)

// 星・ハートモチーフの必要量計算
const adjustedRate = materialRate / tutuRate // tutuRateが2倍なら必要量は半分
```

#### 特殊モチーフの処理フロー
1. **星モチーフ**: 星 → ハンマー → チュチュハウス
2. **ハートモチーフ**: ハート → チーズ → チュチュハウス
3. **レート調整**: `必要パーツレート = 目標モチーフレート / tutuRate`

### 型定義
```typescript
interface CalculationOptions {
  bigMotifBonus: boolean    // 大きなモチーフで生産量を計算する(+100%)
  tutuPort2: boolean       // チュチュハウスの生産量を2/1sで計算する
}
```

### 状態管理
- **CalculatorContext**: 計算オプション設定を全体状態として管理
- **CalculatorApp**: オプション設定の変更ハンドラーを実装
- **useCalculation**: 計算時にオプション設定を計算ロジックに渡す
- **buildEquipmentSettings**: オプション設定を各設備の実効レートに反映

## アーキテクチャ

### 技術スタック
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript（型安全性とコード品質向上）
- **スタイリング**: CSS Modules（既存CSSを段階的に移行、スコープ化）
- **状態管理**: React useState + useContext（適切な状態管理）
- **ビルド**: Static Export (`next export`)
- **Node.js**: v18.17.0以上（nvmで管理）

### 開発環境セットアップ
開発作業を行う前に、必ずNode.jsのバージョンを確認・切り替えを行う：

```bash
# Node.jsバージョン確認
node --version

# 最新のLTS版を使用
nvm use --lts

# その後、npm コマンドを実行
npm run dev
npm run build
```

### プロジェクト構造（リファクタ版）
```
src/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # メインページ
│   ├── globals.css         # 整理されたグローバルスタイル
│   └── page.module.css     # ページ固有スタイル
├── components/
│   ├── Calculator/
│   │   ├── CalculatorApp.tsx          # メイン計算アプリケーション
│   │   ├── CalculatorApp.module.css   # CalculatorApp専用スタイル
│   │   ├── MasterTypeSelector.tsx     # マスタータイプ選択（ミニオン/スペル）
│   │   ├── MasterTypeSelector.module.css # MasterTypeSelector専用スタイル
│   │   ├── HeroGallery.tsx           # ヒーローギャラリー（ランク別表示）
│   │   ├── HeroGallery.module.css    # HeroGallery専用スタイル
│   │   ├── ProductionRateInput.tsx   # 生産速度入力フィールド
│   │   ├── ProductionRateInput.module.css # ProductionRateInput専用スタイル
│   │   ├── EquipmentTierPanel.tsx    # 設備性能選択パネル
│   │   ├── EquipmentTierPanel.module.css # EquipmentTierPanel専用スタイル
│   │   ├── MotifProductionBoosts.tsx # モチーフ生産ブースト設定
│   │   ├── MotifProductionBoosts.module.css # MotifProductionBoosts専用スタイル
│   │   ├── EquipmentUpgradeGrid.tsx  # 設備アップグレード補正率グリッド
│   │   ├── EquipmentUpgradeGrid.module.css # EquipmentUpgradeGrid専用スタイル
│   │   ├── CalculationOptions.tsx    # 計算オプション設定
│   │   ├── CalculationOptions.module.css # CalculationOptions専用スタイル
│   │   ├── RequirementTree.tsx       # 必要リソースツリー表示
│   │   └── RequirementTree.module.css # RequirementTree専用スタイル
│   ├── UI/
│   │   ├── TierCard.tsx           # 再利用可能なカード
│   │   ├── TierCard.module.css    # TierCard専用スタイル
│   │   ├── NumberInput.tsx        # 数値入力コンポーネント
│   │   └── NumberInput.module.css # NumberInput専用スタイル
│   └── Layout/
│       ├── PageLayout.tsx         # ページレイアウト
│       └── PageLayout.module.css  # PageLayout専用スタイル
├── hooks/
│   ├── useCalculatorState.ts      # 状態管理ロジック（整理）
│   ├── useDatabase.ts             # データ読み込み（整理）
│   └── useCalculation.ts          # 計算ロジック（整理）
├── lib/
│   ├── calculator/
│   │   ├── types.ts               # 型定義
│   │   ├── calculations.ts        # 計算ロジック（リファクタ）
│   │   └── equipment.ts           # 設備関連ロジック（リファクタ）
│   ├── data/
│   │   └── loader.ts              # データ読み込み（リファクタ）
│   └── utils/
│       └── image.ts               # 画像処理ユーティリティ
├── types/
│   ├── hero.ts                    # ヒーロー型定義
│   ├── equipment.ts               # 設備型定義
│   └── calculator.ts              # 計算関連型定義
└── public/
    ├── data/                      # JSONファイル
    └── img/                       # 画像アセット
```

## スタイリング方針

### 基本原則
移植作業において、スタイルを壊さないように十分に留意しつつ、リファクタリングを前提とした保守可能なCSS構造を構築する。

#### **CSS変数の使用**
- **カラーコードのみ変数化**: `--color-white`, `--color-border`等
- **その他の値はハードコーディング**: サイズ、スペーシング、フォントサイズ等は直接記述

#### **クラス命名規則**
- **全てキャメルケース**: `.pageTitle`, `.heroCard`, `.selectButton`等
- **BEM記法禁止**: `__`や`--`を使用しない
- **意味的な命名**: 見た目ではなく役割を表すクラス名

#### **ユーティリティクラス禁止**
- **ユーティリティクラス削除**: `.flex`, `.gap-lg`, `.icon-sm`等は使用しない
- **mixinも基本的に不要**: `align-items`, `justify-content`等の単純なスタイルはmixin化しない
- **コンポーネント内で完結**: 各コンポーネントで必要なスタイルを直接記述

#### **タグセレクタ禁止**
- **リセット以外でタグセレクタ使用禁止**: `h1`, `select`, `input`等にスタイルを当てない
- **クラスベースのスタイリング**: 全てのスタイルはクラス名で指定
- **例外**: リセットスタイル、bodyの基本設定のみ

#### **globals.css最小化**
- **本当に必要なもののみ**: カラー変数、リセットスタイル、body設定
- **コンポーネント固有スタイルは各ファイルで**: レイアウト、フォーム要素等は各コンポーネントで解決
- **依存関係の最小化**: グローバルな依存を避け、コンポーネント独立性を保つ

#### **スタイル実装方針**
- **コンポーネント単位**: 各コンポーネントで必要なスタイルを実装
- **CSS Modules使用**: スコープ化されたスタイルで保守性を向上
- **レスポンシブ対応**: モバイルデバイスでも適切に動作

#### **再利用性の考慮**
- **過度な抽象化禁止**: 再利用を前提とした複雑なpropsは避ける
- **ハードコーディング推奨**: 具体的な値を直接記述してシンプルに
- **コンポーネント分割**: 機能単位での分割は行うが、汎用化は避ける

#### **Next.js最適化**
- **Next.js Image使用**: 画像は`next/image`コンポーネントを使用
- **CSS Modules活用**: コンポーネント固有スタイルはCSS Modulesで管理
- **静的最適化**: SSG対応を考慮したスタイル構造

### 実装例
```css
/* globals.css - 最小限のグローバルスタイル */
:root {
  --color-white: #ffffff;
  --color-border: #e5e7eb;
  --color-muted: #6b7280;
}

/* ComponentName.module.css - コンポーネント固有スタイル */
.container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.title {
  font-size: 20px;
  color: var(--color-muted);
}
```

## 共通レイアウトパターン（実装済み）

### 設定行レイアウト
各設定項目で共通使用する標準的なレイアウトパターンを定義。

#### **グローバルクラス（globals.css）**
```css
/* Setting row layout - 設定項目の標準レイアウト */
.settingRow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.settingLabel {
  width: 180px;
  min-width: 180px;
  white-space: nowrap;
  text-align: left;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  background: var(--color-bg-soft);
  border-radius: 4px;
}

.settingOptions {
  padding: 4px 0;
}
```

#### **使用方法**
```tsx
// MasterTypeSelector.tsx
<div className="settingRow">
  <label className="settingLabel">マスター</label>
  <div className={`settingOptions ${styles.tabs}`}>
    {/* コンポーネント固有の要素 */}
  </div>
</div>
```

#### **設計原則**
- **グローバル**: 共通レイアウト構造（`.settingRow`, `.settingLabel`, `.settingOptions`）
- **コンポーネント固有**: 具体的な表示スタイル（`.tabs`, `.tab`, `.icon`等）
- **組み合わせ**: `className={`settingOptions ${styles.tabs}`}`で両方を適用

### 実装済みコンポーネント

#### **PageTitle**
- **構造**: タイトル行 + 説明文
- **特徴**: Next.js Image使用、ハードコーディング
- **ファイル**: `PageTitle.tsx`, `PageTitle.module.css`

#### **MasterTypeSelector**
- **構造**: 設定行レイアウト + タブ選択
- **特徴**: グローバルレイアウト + コンポーネント固有スタイル
- **ファイル**: `MasterTypeSelector.tsx`, `MasterTypeSelector.module.css`

#### **CalculatorApp**
- **構造**: メインコンテナ + エラー表示
- **特徴**: 各コンポーネントの配置管理
- **ファイル**: `CalculatorApp.tsx`, `CalculatorApp.module.css`

### 次の実装予定
他の設定項目（ヒーロー選択、生産速度入力、設備性能等）も同じ`.settingRow`パターンを使用して統一感のあるUIを構築予定。

## コンポーネント設計

### リファクタリング方針
任分離された理解しやすいコンポーネント構造に再構築する。

#### 状態管理の整理
```typescript
// 適切に型定義された状態管理
interface CalculatorState {
  master: 'minion' | 'spell';
  selectedHero: string;
  targetRate: number;
  equipment: EquipmentSettings;
  boosts: MotifBoosts;
  coefficients: EquipmentCoefficients;
  options: CalculatorOptions;
}

// Context APIで状態を管理
const CalculatorContext = createContext<CalculatorState>();
```

#### 主要コンポーネント

##### CalculatorApp.tsx
- 全体の状態管理とコンテキスト提供
- 子コンポーネントのレイアウト
- 計算トリガーの制御

##### MasterTypeSelector.tsx
- ミニオンマスター/スペルマスター選択
- 選択に応じたUI表示制御
- アイコン付きタブインターフェース

##### HeroGallery.tsx
- ヒーロー一覧のギャラリー表示
- ランク別グルーピング（S+A、B、C等）
- 展開/折りたたみ機能
- ヒーロー画像とフォールバック処理

##### ProductionRateInput.tsx
- 目標生産速度の数値入力
- 入力値バリデーション
- 単位表示（/s）

##### EquipmentTierPanel.tsx（実装済み）
- 設備性能選択（標準/高性能/最上位）
- 5種類の設備対応（キャンバス、複合キャンバス、モチーフメーカー、スポイト、スペルジェネレーター）
- マスタータイプ連動表示制御（スペルジェネレーターはスペルマスター専用）
- スペルジェネレーター特殊オプション（インク瓶3倍消費機能）
- レスポンシブデザイン対応

##### MotifProductionBoosts.tsx（実装済み）
- モチーフ生産率ブースト設定（100%〜300%、25%刻み）
- 円・四角・三角の個別ブースト設定
- モチーフアイコン表示付きセレクトボックス
- レスポンシブデザイン対応（デスクトップ：横並び、モバイル：縦積み）
- 既存システムと同じ25%刻みの選択肢（100%, 125%, 150%, 175%, 200%, 225%, 250%, 275%, 300%）

##### EquipmentUpgradeGrid.tsx
- 設備アップグレード補正率設定
- グリッドレイアウトでの補正率選択
- チェックボックスオプション

##### CalculationOptions.tsx
- 計算に関するオプション設定
- 大きなモチーフボーナス
- その他の計算パラメータ

##### RequirementTree.tsx
- 必要リソースのツリー表示
- 階層構造での要件表示
- 材料表示の切り替え機能

### リファクタリング対象
1. **巨大な関数の分割**: 既存の長い関数を責任ごとに分割
2. **グローバル変数の整理**: 適切なスコープでの状態管理
3. **DOM操作の抽象化**: React的な宣言的UI更新
4. **計算ロジックの分離**: ビジネスロジックとUI分離
5. **型安全性の追加**: TypeScriptによる型チェック

## データモデル

### 型定義による整理
既存のJSONデータ構造を分析し、適切な型定義を作成して型安全性を確保する。

```typescript
// 整理された型定義
interface Hero {
  id: string;
  name: string;
  rank: HeroRank;
  icon?: string;
  type?: 'spell';
  requirements?: Requirement[];
}

interface Equipment {
  canvas: EquipmentTier;
  compositeCanvas: EquipmentTier;
  motifMaker: MotifMaker;
  pipette: EquipmentTier;
  spellGenerator?: EquipmentTier;
  // その他の設備
}

interface CalculationResult {
  heroId: string;
  targetRate: number;
  requirements: RequirementNode[];
  equipmentNeeded: EquipmentCount;
}

// 設備性能関連型定義（実装済み）
type EquipmentTier = 'base' | 'high' | 'top'

interface EquipmentTierSettings {
  canvas: EquipmentTier
  compositeCanvas: EquipmentTier
  motifMaker: EquipmentTier
  pipette: EquipmentTier
  spellGenerator: EquipmentTier
}

interface SpellGeneratorOptions {
  tripleInkBottleConsumption: boolean // インク瓶3倍消費でスペル生産数2倍
}

// 状態管理Context（実装済み）
interface CalculatorContextType {
  selectedMaster: MasterType
  equipmentTiers: EquipmentTierSettings
  targetRate: number
  showMaterials: boolean
}

// データアクセス層の整理
class DatabaseService {
  private heroes: Map<string, Hero>;
  private equipment: Equipment;
  
  async loadData(): Promise<void> {
    // 整理されたデータ読み込みロジック
  }
  
  getHero(id: string): Hero | undefined {
    return this.heroes.get(id);
  }
}
```

## リファクタリング戦略

### 段階的リファクタリング
1. **Phase 1**: プロジェクト構造作成、型定義
2. **Phase 2**: データ層の整理（DatabaseService作成）
3. **Phase 3**: 計算ロジックの分離・整理
4. **Phase 4**: UIコンポーネントの分割・作成
5. **Phase 5**: 状態管理の整理
6. **Phase 6**: スタイリングの整理
7. **Phase 7**: テスト追加とSSG設定

### リファクタリング原則
- **単一責任原則**: 各コンポーネント・関数は1つの責任のみ
- **依存性の注入**: テスタブルな構造
- **型安全性**: TypeScriptによる型チェック
- **宣言的UI**: React的な状態駆動UI
- **関数型プログラミング**: 副作用の最小化

### 既存コードの分析と整理
- **巨大関数の分割**: 責任ごとに小さな関数に分割
- **グローバル状態の整理**: 適切なスコープでの状態管理
- **命名の統一**: 一貫した命名規則の適用
- **重複コードの除去**: DRY原則の適用
- **エラーハンドリングの追加**: 適切なエラー処理

## 実装済み機能一覧

### 基本機能（完了）
- ✅ プロジェクト構築と初期画面表示
- ✅ マスタータイプ選択（ミニオン/スペル）
- ✅ ヒーロー選択（ランク別表示、画像対応）
- ✅ 目標生産速度入力
- ✅ 基本計算機能と結果表示

### 設備性能選択機能（完了）
- ✅ 5種類設備の性能選択UI
- ✅ マスタータイプ連動表示制御
- ✅ 性能設定の計算反映
- ✅ スペル/ヒーロー判定による適切な設備使用
- ✅ スペルジェネレーター特殊オプション

### モチーフ生産率設定機能（完了）
- ✅ MotifProductionBoostsコンポーネントの実装
- ✅ 円・四角・三角の個別ブースト設定UI（100%〜300%、25%刻み）
- ✅ モチーフアイコン表示付きセレクトボックス
- ✅ 計算ロジックへのブースト設定反映
- ✅ 既存システムと同じ計算式の適用

### 設備補正率設定機能（完了）
- ✅ EquipmentUpgradeGridコンポーネントの実装
- ✅ 6種類設備の補正率設定UI（キャンバス・モチーフメーカー・スポイト・ハサミ・ミキサー・アルベドメーカー）
- ✅ 設備アイコンの動的表示（性能連動）
- ✅ 特殊オプション（ハサミ出力ポート×2）
- ✅ 計算ロジックへの補正率設定反映
- ✅ 原色必要量計算への効率反映（ミキサー・アルベドメーカー）
- ✅ スペルマスター専用UI制御（アルベドメーカー）

### 計算オプション機能（完了）
- ✅ CalculationOptionsコンポーネントの実装
- ✅ 大きなモチーフボーナス設定（デフォルトON）
- ✅ チュチュハウス2/1s設定（デフォルトON）
- ✅ 計算ロジックへのオプション設定反映
- ✅ モチーフメーカーボーナスの動的適用
- ✅ 特殊モチーフ（星・ハート）の生産効率制御
- ✅ ハンマー・チーズ必要量の正確な計算

### 計算精度（完了）
- ✅ キャンバス/複合キャンバス使い分け（素材種類数判定）
- ✅ スペルジェネレーター計算
- ✅ 性能倍率の正確な適用
- ✅ インク瓶3倍消費機能の効率計算
- ✅ モチーフ生産率ブースト計算の統合
- ✅ 設備補正率の計算統合
- ✅ 混色インク・白インクの効率計算
- ✅ 切断モチーフの出力ポート×2効果
- ✅ 計算オプションの動的適用
- ✅ 特殊モチーフの生産フロー制御