# リーダブルコード ガイドライン

このドキュメントは、『リーダブルコード』（Dustin Boswell, Trevor Foucher 著）の要約を基に、PawapokeEventMakerプロジェクトでコード品質を保つためのガイドラインです。

---

## 1. 表面レベルの改善

### 1.1 名前に情報を詰め込む

#### 良い例
```javascript
// 明確で具体的な名前
const eventDialogSequence = [];
const isEventSaved = false;
const maxDialogCount = 50;

// 悪い例
const data = [];
const flag = false;
const num = 50;
```

#### ポイント
- **変数名**: その変数が何を表しているか明確に
- **関数名**: 何をする関数か、何を返すかが分かるように
- **クラス名**: そのクラスの役割が分かるように
- **定数名**: その値の意味が分かるように

### 1.2 誤解を招く名前を避ける

#### 避けるべき名前
```javascript
// 悪い例
const data = getData();  // 何のデータ？
const temp = calculate(); // 一時的なのか、温度なのか？
const size = getSize();   // 何のサイズ？高さ？幅？要素数？
```

#### 良い例
```javascript
// 明確な名前
const eventData = getEventData();
const temporaryBuffer = calculate();
const dialogCount = getDialogCount();
```

### 1.3 美しさ

#### 一貫性のあるスタイル
```javascript
// 良い例: 一貫したインデントとフォーマット
function createEvent(eventId, eventName) {
    const event = {
        id: eventId,
        name: eventName,
        dialogs: []
    };
    return event;
}

// 悪い例: 一貫性のないスタイル
function createEvent(eventId,eventName){
const event={id:eventId,name:eventName,dialogs:[]};
return event;}
```

#### 整列
```javascript
// 良い例: 関連する項目を整列
const event = {
    id:        eventId,
    name:      eventName,
    thumbnail: thumbnailPath,
    dialogs:   dialogArray
};
```

### 1.4 コメント

#### 良いコメント
```javascript
// イベントIDは選択肢キーとして使用されるため、作成後は変更不可
// 新しいIDが必要な場合は新規イベントとして作成する
function updateEvent(eventId, newData) {
    // イベントIDの変更は許可しない
    if (newData.id !== eventId) {
        throw new Error('Event ID cannot be changed');
    }
    // ...
}
```

#### 悪いコメント
```javascript
// イベントを更新する
function updateEvent(eventId, newData) {
    // データを更新
    eventData[eventId] = newData;
}
```

#### コメントの原則
- **「なぜ」を説明する**: コードの意図や理由を説明
- **複雑な処理を説明する**: アルゴリズムやロジックの説明
- **将来の注意点を記す**: バグや制約事項を記録
- **「何を」は書かない**: コードから明らかなことは書かない

---

## 2. ループとロジックの単純化

### 2.1 制御フローを読みやすくする

#### 早期リターン
```javascript
// 良い例: 早期リターンでネストを減らす
function validateEvent(event) {
    if (!event) {
        return false;
    }
    if (!event.id) {
        return false;
    }
    if (!event.dialogs || event.dialogs.length === 0) {
        return false;
    }
    return true;
}

// 悪い例: 深いネスト
function validateEvent(event) {
    if (event) {
        if (event.id) {
            if (event.dialogs && event.dialogs.length > 0) {
                return true;
            }
        }
    }
    return false;
}
```

#### 条件式の簡潔化
```javascript
// 良い例: 明確な条件式
const hasDialogs = event.dialogs && event.dialogs.length > 0;
if (hasDialogs) {
    // ...
}

// 悪い例: 複雑な条件式
if (event && event.dialogs && event.dialogs.length > 0) {
    // ...
}
```

### 2.2 巨大な式を分割する

#### 説明変数の導入
```javascript
// 良い例: 説明変数で意図を明確に
const isEventComplete = event.dialogs.length > 0 && 
                        event.dialogs.every(d => d.text && d.speaker && d.imagePath);
if (isEventComplete) {
    saveEvent(event);
}

// 悪い例: 複雑な式
if (event.dialogs.length > 0 && 
    event.dialogs.every(d => d.text && d.speaker && d.imagePath)) {
    saveEvent(event);
}
```

---

## 3. コードの再構成

### 3.1 関数を小さく、単一の責任に

#### 単一責任の原則
```javascript
// 良い例: 各関数が1つの責任を持つ
function createEvent(eventId, eventName) {
    validateEventId(eventId);
    const event = buildEventObject(eventId, eventName);
    return event;
}

function validateEventId(eventId) {
    if (!eventId || eventId.length === 0) {
        throw new Error('Event ID is required');
    }
}

function buildEventObject(eventId, eventName) {
    return {
        id: eventId,
        name: eventName,
        dialogs: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

// 悪い例: 1つの関数が複数の責任を持つ
function createEvent(eventId, eventName) {
    if (!eventId || eventId.length === 0) {
        throw new Error('Event ID is required');
    }
    const event = {
        id: eventId,
        name: eventName,
        dialogs: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    // さらに他の処理も...
    return event;
}
```

### 3.2 関数の抽象化レベルを揃える

```javascript
// 良い例: 同じ抽象化レベルで記述
function processEvent(event) {
    validateEvent(event);
    enrichEventData(event);
    saveEvent(event);
}

// 悪い例: 抽象化レベルが混在
function processEvent(event) {
    if (!event.id) {  // 低レベル
        throw new Error('Invalid event');
    }
    enrichEventData(event);  // 高レベル
    event.dialogs.forEach(d => {  // 低レベル
        d.text = d.text.trim();
    });
    saveEvent(event);  // 高レベル
}
```

### 3.3 重複コードを削除する

```javascript
// 良い例: 共通処理を関数化
function validateDialog(dialog) {
    return dialog.text && 
           dialog.speaker && 
           dialog.imagePath;
}

function validateEvent(event) {
    if (!event.id) return false;
    return event.dialogs.every(validateDialog);
}

// 悪い例: 重複コード
function validateEvent(event) {
    if (!event.id) return false;
    for (let dialog of event.dialogs) {
        if (!dialog.text || !dialog.speaker || !dialog.imagePath) {
            return false;
        }
    }
    return true;
}

function validateDialog(dialog) {
    if (!dialog.text || !dialog.speaker || !dialog.imagePath) {
        return false;
    }
    return true;
}
```

---

## 4. テストとデバッグ

### 4.1 テストしやすいコード

#### 副作用を分離する
```javascript
// 良い例: 純粋関数（テストしやすい）
function calculateDialogCount(event) {
    return event.dialogs ? event.dialogs.length : 0;
}

// 悪い例: 副作用がある（テストしにくい）
let globalCount = 0;
function calculateDialogCount(event) {
    globalCount = event.dialogs ? event.dialogs.length : 0;
    updateUI(globalCount);  // 副作用
    return globalCount;
}
```

### 4.2 エラーハンドリング

```javascript
// 良い例: 明確なエラーメッセージ
function loadEvent(eventId) {
    if (!eventId) {
        throw new Error('Event ID is required');
    }
    const event = eventDatabase.get(eventId);
    if (!event) {
        throw new Error(`Event with ID "${eventId}" not found`);
    }
    return event;
}

// 悪い例: 不明確なエラー
function loadEvent(eventId) {
    const event = eventDatabase.get(eventId);
    if (!event) {
        throw new Error('Error');
    }
    return event;
}
```

---

## 5. 命名規則

### 5.1 変数名

| 用途 | 命名規則 | 例 |
|------|---------|-----|
| 真偽値 | `is`, `has`, `can`, `should` で始める | `isEventSaved`, `hasDialogs`, `canEdit` |
| 配列 | 複数形または `List`, `Array` で終わる | `events`, `dialogList`, `eventArray` |
| 関数 | 動詞で始める | `createEvent`, `validateDialog`, `saveData` |
| クラス | 名詞、大文字で始める | `EventManager`, `DialogEditor` |
| 定数 | 大文字、アンダースコア区切り | `MAX_DIALOG_COUNT`, `DEFAULT_IMAGE_PATH` |

### 5.2 関数名

```javascript
// 良い例: 動詞 + 名詞で明確に
function createEvent(eventId, eventName) { }
function validateEvent(event) { }
function saveEventToDatabase(event) { }
function exportEventToDialogsJs(event) { }

// 悪い例: 曖昧な名前
function process(data) { }
function handle() { }
function doSomething() { }
```

---

## 6. コメントのベストプラクティス

### 6.1 書くべきコメント

```javascript
// ✅ なぜこの実装を選んだか
// イベントIDは選択肢キーとして使用されるため、変更を許可しない
// これにより既存の参照が壊れることを防ぐ

// ✅ 複雑なアルゴリズムの説明
// セリフの順序を変更する際、配列のインデックスを再計算する
// O(n)の時間計算量で処理する

// ✅ 将来の注意点
// TODO: データベース対応時に、この部分を非同期処理に変更する必要がある
// FIXME: 大量のイベント読み込み時にパフォーマンス問題が発生する可能性

// ✅ 制約事項
// 注意: この関数は最大100イベントまで処理可能
```

### 6.2 書かないべきコメント

```javascript
// ❌ コードから明らかなこと
// イベントを保存する
function saveEvent(event) { }

// ❌ コードと矛盾するコメント
// イベントIDを変更する
function updateEvent(eventId, newData) {
    // 実際にはIDは変更していない
}

// ❌ 自明な説明
// iを0から始める
for (let i = 0; i < events.length; i++) { }
```

---

## 7. コードの構造化

### 7.1 ファイルの構成

```
src/
├── models/          # データモデル
│   ├── Event.js
│   └── Dialog.js
├── services/         # ビジネスロジック
│   ├── EventService.js
│   └── DialogService.js
├── utils/           # ユーティリティ関数
│   ├── validation.js
│   └── formatters.js
└── components/      # UIコンポーネント
    ├── EventList.js
    └── EventEditor.js
```

### 7.2 関数の順序

1. 公開関数（エクスポートされる関数）
2. プライベート関数（内部で使用される関数）
3. ヘルパー関数（小さなユーティリティ関数）

---

## 8. チェックリスト

コードレビュー時に確認すべき項目：

- [ ] 変数名・関数名は明確で、その役割が分かるか
- [ ] 関数は単一の責任を持っているか
- [ ] 関数は短く、理解しやすいか（50行以内を目安）
- [ ] コメントは「なぜ」を説明しているか
- [ ] 重複コードはないか
- [ ] エラーハンドリングは適切か
- [ ] テストしやすい構造になっているか
- [ ] 一貫したコーディングスタイルか

---

## 9. 参考資料

- 『リーダブルコード』（Dustin Boswell, Trevor Foucher 著、角 征典 訳、オライリー・ジャパン）
- このガイドラインは上記書籍の要約を基に、PawapokeEventMakerプロジェクト向けにカスタマイズしたものです

---

## 10. プロジェクト固有のルール

### 10.1 イベントデータの扱い
- イベントIDは不変（immutable）として扱う
- イベント名とサムネイルは変更可能

### 10.2 エラーメッセージ
- ユーザー向けエラーメッセージは日本語で表示
- 開発者向けエラーメッセージは英語で記述（ログ用）

### 10.3 非同期処理
- データベース操作は非同期処理（async/await）を使用
- エラーハンドリングは必ず実装

---

**最終更新**: 2025-12-13

