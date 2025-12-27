# UIデザインシステム

## 1. デザイン原則

### 1.1 基本方針
- **レトロゲーム風**: 既存の `pawapoke-MFver` の雰囲気を継承
- **直感的な操作**: 非エンジニアでも迷わず使える
- **一貫性**: すべての画面で統一されたデザイン
- **レスポンシブ**: デスクトップ、タブレット、スマートフォンに対応

### 1.2 デザインの方向性
- ノベルゲームツールらしい親しみやすさ
- 機能性を重視したシンプルなデザイン
- 適度な装飾で視認性を確保

---

## 2. カラーパレット

### 2.1 プライマリカラー（メインカラー）

#### 緑系（主要アクション）
```css
--color-primary: #4CAF50;        /* メインボタン、ヘッダー */
--color-primary-dark: #45a049;   /* ホバー時 */
--color-primary-light: #81C784; /* ライトバリエーション */
```

**使用例**: 主要なボタン、ヘッダー背景、成功メッセージ

#### 青系（セカンダリアクション）
```css
--color-secondary: #3498db;      /* セカンダリボタン */
--color-secondary-dark: #2980b9; /* ホバー時 */
--color-secondary-light: #5DADE2; /* ライトバリエーション */
```

**使用例**: 音楽コントロールボタン、情報表示、リンク

### 2.2 ニュートラルカラー（背景・テキスト）

```css
--color-background: #f0f0f0;     /* ページ背景 */
--color-surface: #ffffff;       /* カード、パネル背景 */
--color-text-primary: #000000;   /* メインテキスト */
--color-text-secondary: #666666;  /* サブテキスト */
--color-border: #e0e0e0;         /* ボーダー */
```

### 2.3 状態カラー

```css
--color-success: #4CAF50;        /* 成功 */
--color-warning: #FF9800;        /* 警告 */
--color-error: #F44336;          /* エラー */
--color-info: #2196F3;           /* 情報 */
```

### 2.4 特殊カラー

```css
--color-textbox-bg: #7FFFD4;    /* テキストボックス背景（アクアマリン） */
--color-shadow: rgba(0, 0, 0, 0.2); /* 影 */
--color-shadow-hover: rgba(0, 0, 0, 0.3); /* ホバー時の影 */
```

### 2.5 カラー使用ガイドライン

| 用途 | カラー | 使用例 |
|------|--------|--------|
| 主要ボタン | `--color-primary` | 保存、作成、削除ボタン |
| セカンダリボタン | `--color-secondary` | キャンセル、戻るボタン |
| 背景 | `--color-background` | ページ全体の背景 |
| カード/パネル | `--color-surface` | イベントカード、編集パネル |
| エラーメッセージ | `--color-error` | バリデーションエラー |

---

## 3. タイポグラフィ（文字のデザイン）

### 3.1 フォントファミリー

#### メインフォント（レトロゲーム風）
```css
--font-primary: 'DotGothic16', sans-serif;
```
- **用途**: ボタン、ヘッダー、主要なテキスト
- **特徴**: レトロゲーム風の親しみやすいフォント

#### セカンダリフォント（オプション）
```css
--font-secondary: 'Press Start 2P', sans-serif;
```
- **用途**: 特別な強調が必要な場合（使用は控えめに）

#### システムフォント（フォールバック）
```css
--font-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
```
- **用途**: 本文、長文テキスト

### 3.2 フォントサイズ

```css
--font-size-xs: 12px;    /* 補足テキスト */
--font-size-sm: 14px;    /* 小さなテキスト */
--font-size-base: 16px;  /* 基本サイズ（本文） */
--font-size-lg: 18px;    /* やや大きめ */
--font-size-xl: 20px;    /* ヘッダー、見出し */
--font-size-2xl: 24px;   /* 大きな見出し */
--font-size-3xl: 32px;   /* 特大見出し（使用は控えめに） */
```

### 3.3 フォントウェイト

```css
--font-weight-normal: 400;  /* 通常 */
--font-weight-bold: 700;     /* 太字 */
```

### 3.4 行間（ライン高さ）

```css
--line-height-tight: 1.2;   /* 見出し */
--line-height-normal: 1.5;  /* 本文 */
--line-height-relaxed: 1.8; /* 長文 */
```

### 3.5 タイポグラフィ使用例

| 要素 | フォント | サイズ | ウェイト | 行間 |
|------|---------|--------|----------|------|
| ページタイトル | DotGothic16 | 24px | 700 | 1.2 |
| 見出し（H1） | DotGothic16 | 20px | 700 | 1.2 |
| 見出し（H2） | DotGothic16 | 18px | 700 | 1.2 |
| 本文 | システムフォント | 16px | 400 | 1.5 |
| ボタンテキスト | DotGothic16 | 16px | 400 | 1.2 |
| 補足テキスト | システムフォント | 14px | 400 | 1.5 |

---

## 4. スペーシング（余白）

### 4.1 スペーシングスケール

```css
--spacing-xs: 4px;    /* 非常に小さい余白 */
--spacing-sm: 8px;    /* 小さい余白 */
--spacing-md: 16px;   /* 中程度の余白（基本単位） */
--spacing-lg: 24px;   /* 大きい余白 */
--spacing-xl: 32px;   /* 非常に大きい余白 */
--spacing-2xl: 48px;  /* 特大余白 */
```

### 4.2 スペーシング使用ガイドライン

| 用途 | スペーシング | 例 |
|------|------------|-----|
| 要素間の最小間隔 | `--spacing-sm` | アイコンとテキストの間 |
| コンポーネント内の余白 | `--spacing-md` | ボタン内のパディング |
| セクション間の余白 | `--spacing-lg` | カード間のマージン |
| 大きなセクション間 | `--spacing-xl` | ページセクション間 |

---

## 5. ボーダー（境界線）

### 5.1 ボーダー半径（角丸）

```css
--border-radius-sm: 8px;   /* 小さな角丸 */
--border-radius-md: 16px;  /* 中程度の角丸 */
--border-radius-lg: 20px;  /* 大きい角丸 */
--border-radius-full: 30px; /* 完全な丸（ボタン用） */
```

### 5.2 ボーダー幅

```css
--border-width-thin: 1px;  /* 細い線 */
--border-width-medium: 2px; /* 中程度 */
--border-width-thick: 4px;  /* 太い線 */
```

### 5.3 ボーダー色

```css
--border-color: var(--color-border);
--border-color-focus: var(--color-primary);
```

---

## 6. シャドウ（影）

### 6.1 シャドウ定義

```css
--shadow-sm: 0px 2px 4px rgba(0, 0, 0, 0.1);      /* 小さな影 */
--shadow-md: 0px 4px 6px rgba(0, 0, 0, 0.2);      /* 中程度の影（標準） */
--shadow-lg: 0px 8px 12px rgba(0, 0, 0, 0.3);     /* 大きい影（ホバー時） */
--shadow-xl: 0px 12px 24px rgba(0, 0, 0, 0.4);    /* 特大影（モーダル） */
```

### 6.2 シャドウ使用例

| 要素 | シャドウ | 状態 |
|------|---------|------|
| カード | `--shadow-md` | 通常 |
| ボタン | `--shadow-md` | 通常 |
| ボタン | `--shadow-lg` | ホバー時 |
| モーダル | `--shadow-xl` | 常時 |

---

## 7. トランジション（アニメーション）

### 7.1 トランジション定義

```css
--transition-fast: 0.15s ease;    /* 高速（ホバーなど） */
--transition-base: 0.3s ease;     /* 標準（ボタンなど） */
--transition-slow: 0.5s ease;     /* 低速（フェードなど） */
```

### 7.2 トランジション使用例

| 要素 | トランジション | プロパティ |
|------|--------------|-----------|
| ボタンホバー | `--transition-base` | background-color, transform, box-shadow |
| カードホバー | `--transition-base` | transform, box-shadow |
| モーダル表示 | `--transition-slow` | opacity, transform |

### 7.3 ホバーエフェクト

```css
/* ボタンのホバー例 */
.button:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}
```

---

## 8. コンポーネント

### 8.1 ボタン

#### プライマリボタン
```css
.button-primary {
  background-color: var(--color-primary);
  color: white;
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  padding: 10px 20px;
  border-radius: var(--border-radius-full);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}

.button-primary:hover {
  background-color: var(--color-primary-dark);
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}
```

#### セカンダリボタン
```css
.button-secondary {
  background-color: var(--color-secondary);
  color: white;
  /* その他はプライマリボタンと同じ */
}
```

#### ボタンサイズ
- **小**: `padding: 8px 16px; font-size: 14px;`
- **中**: `padding: 10px 20px; font-size: 16px;`（標準）
- **大**: `padding: 12px 24px; font-size: 18px;`

### 8.2 カード

```css
.card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### 8.3 入力フィールド

```css
.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: var(--border-width-thin) solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-family: var(--font-system);
  transition: var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--border-color-focus);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}
```

### 8.4 テキストエリア

```css
.textarea {
  /* 入力フィールドと同じスタイル */
  min-height: 100px;
  resize: vertical;
}
```

### 8.5 モーダル

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  max-width: 90%;
  max-height: 90%;
  box-shadow: var(--shadow-xl);
}
```

---

## 9. レイアウト

### 9.1 コンテナ

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.container-sm {
  max-width: 800px;
}

.container-lg {
  max-width: 1400px;
}
```

### 9.2 グリッドシステム

```css
.grid {
  display: grid;
  gap: var(--spacing-md);
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}
```

### 9.3 フレックスボックス

```css
.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-center {
  align-items: center;
  justify-content: center;
}

.flex-between {
  justify-content: space-between;
}
```

---

## 10. レスポンシブデザイン

### 10.1 ブレークポイント

```css
/* モバイルファーストアプローチ */
--breakpoint-sm: 640px;   /* スマートフォン */
--breakpoint-md: 768px;   /* タブレット */
--breakpoint-lg: 1024px;  /* デスクトップ */
--breakpoint-xl: 1280px;  /* 大型デスクトップ */
```

### 10.2 メディアクエリ例

```css
/* スマートフォン（デフォルト） */
.container {
  padding: var(--spacing-sm);
}

/* タブレット以上 */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
  
  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* デスクトップ以上 */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-lg);
  }
  
  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 10.3 レスポンシブ対応ガイドライン

| 画面サイズ | レイアウト | フォントサイズ | 余白 |
|-----------|-----------|--------------|------|
| スマートフォン (< 768px) | 1カラム | 基本サイズ | 小さい余白 |
| タブレット (768px - 1024px) | 2カラム | 基本サイズ | 中程度の余白 |
| デスクトップ (> 1024px) | 3-4カラム | 基本サイズ | 大きい余白 |

---

## 11. アイコン

### 11.1 アイコンサイズ

```css
--icon-size-sm: 16px;
--icon-size-md: 24px;
--icon-size-lg: 32px;
--icon-size-xl: 48px;
```

### 11.2 アイコン使用ガイドライン

- 絵文字を使用（既存プロジェクトと統一）
- または、アイコンフォント（Font Awesome等）を使用
- サイズは用途に応じて選択

---

## 12. 状態表示

### 12.1 ローディング

```css
.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 12.2 エラーメッセージ

```css
.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}
```

### 12.3 成功メッセージ

```css
.success-message {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}
```

---

## 13. アクセシビリティ

### 13.1 フォーカス表示

```css
.focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 13.2 コントラスト比

- テキストと背景のコントラスト比は4.5:1以上（WCAG AA基準）
- 大きなテキスト（18px以上）は3:1以上

### 13.3 キーボードナビゲーション

- すべてのインタラクティブ要素はキーボードで操作可能
- Tab順序は論理的であること

---

## 14. 実装方法

### 14.1 CSS変数の使用

すべてのデザインシステムの値はCSS変数として定義し、使用します：

```css
:root {
  /* カラー */
  --color-primary: #4CAF50;
  /* ... 他の変数 ... */
}

.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
}
```

### 14.2 コンポーネント化

再利用可能なコンポーネントとして実装：

```javascript
// React/Vue等のコンポーネント例
<Button variant="primary" size="medium">
  保存
</Button>
```

---

## 15. 参考資料

- 既存プロジェクト: `pawapoke-MFver`
  - `styles.css` - 既存のスタイル定義
  - `index.html` - HTML構造の参考

---

**最終更新**: 2025-12-13

