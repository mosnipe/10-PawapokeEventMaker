# PawapokeEventMaker 開発進捗

## プロジェクト概要
キャラクターとセリフと画像が表示される一連の流れ（イベント）を作成するアプリケーション

---

## 作業ログ

### 2025-12-27
- [x] Vercelデプロイ準備
  - Vercelデプロイ時のフレームワーク選択を確認（静的サイトのため「Other」を選択）
  - ビルドコマンド不要（静的サイトとして扱う）
- [x] Favicon設定
  - `img`フォルダを作成
  - `pawapoke.jpg`を`img`フォルダに移動
  - `index.html`にfaviconの設定を追加（初期はJPEG形式）
  - JPEG画像をICO形式に変換（Python + Pillowを使用）
  - `favicon.ico`を作成（16x16、32x32、48x48の複数サイズを含む）
  - `index.html`のfavicon設定をICO形式に更新
  - 変換スクリプト（`convert_to_ico.py`）を作成

### 2025-12-13
- [x] プロジェクトフォルダ `10-PawapokeEventMaker` を作成
- [x] 進捗管理ファイル（このファイル）を作成
- [x] 要求定義書（`requirements.md`）を作成
  - 機能要件（REQ-001 ～ REQ-015）を定義
  - 非機能要件（NFR-001 ～ NFR-006）を定義
  - データモデル、画面要件、入力・出力要件を定義
  - テスト仕様書での参照を意識した構成
- [x] 要求定義書の修正
  - REQ-002: イベントID変更不可の理由を明記（選択肢キーとして使用されるため）
  - REQ-004: イベント一覧表示を修正（ID、イベント名、サムネイルを表示、セリフ数は削除）
  - REQ-009, REQ-010: データベース使用を追加（Supabase、Vercel Postgres、Neon、スプレッドシート、Notion）
  - REQ-015: スマホ対応（iPhone、Android）を追加
  - NFR-005: データ保護要件を更新（データベース使用時の認証・認可）
  - NFR-006: リーダブルコード基準への参照を追加
- [x] リーダブルコードガイドライン（`docs/readable-code-guidelines.md`）を作成
  - 命名規則、関数設計、コメントのベストプラクティス
  - コード構造化、テストしやすいコードの書き方
  - プロジェクト固有のルールを追加
- [x] 要求定義書の修正（イベントID自動生成）
  - REQ-001: イベントIDをランダム自動生成に変更（ユーザー入力不要）
  - 6.2: イベント編集画面からイベントID入力欄を削除（表示のみ）
  - 7.1.1: イベントIDの入力要件を自動生成仕様に変更
  - 7.1.2: イベント名の入力要件を追加
- [x] デザインワークフロー検討（`docs/design-workflow.md`）を作成
  - FigmaとCursorの連携方法を調査・整理
  - 推奨アプローチ: デザインシステム定義 → Figmaデザイン → コード実装
  - Figma MCPサーバー連携の設定方法も記載（参考）
- [x] UIデザインシステム（`docs/ui-design-system.md`）を作成
  - カラーパレット（プライマリ、セカンダリ、ニュートラル、状態カラー）
  - タイポグラフィ（フォント、サイズ、ウェイト）
  - スペーシング、ボーダー、シャドウ
  - コンポーネント（ボタン、カード、入力フィールド等）
  - レスポンシブデザイン（ブレークポイント）
  - 既存プロジェクト（pawapoke-MFver）のデザインを参考に定義
- [x] プロジェクト構造の作成
  - フォルダ構成（css/, js/, data/, docs/）
  - 基本ファイルの作成
- [x] デザインシステムの実装
  - `css/design-system.css`: CSS変数の定義
  - `css/components.css`: コンポーネントスタイル
  - `css/main.css`: メインスタイル
- [x] 基本機能の実装
  - `js/utils/eventIdGenerator.js`: イベントID自動生成
  - `js/services/eventService.js`: イベント管理サービス（ローカルストレージ版）
  - `js/components/EventList.js`: イベント一覧コンポーネント
  - `js/components/EventEditor.js`: イベント編集コンポーネント
  - `js/main.js`: メインアプリケーション
  - `index.html`: メインHTML
- [x] README.mdの作成
- [x] Googleスプレッドシート連携の準備
  - `docs/google-sheets-integration.md`: 連携方法の説明ドキュメント
  - `SETUP_GOOGLE_SHEETS.md`: セットアップ手順ガイド
  - `js/config.js`: 設定ファイル（ストレージタイプ、Google Script URL）
  - `js/services/googleSheetsService.js`: Googleスプレッドシート連携サービス
  - 既存コードを非同期処理に対応（main.js, EventList.js, EventEditor.js）
  - フォールバック機能: 接続失敗時はローカルストレージを使用
- [x] プロジェクト構造の作成
  - フォルダ構成（css/, js/, data/, docs/）
  - 基本ファイルの作成
- [x] デザインシステムの実装
  - `css/design-system.css`: CSS変数の定義
  - `css/components.css`: コンポーネントスタイル
  - `css/main.css`: メインスタイル
- [x] 基本機能の実装
  - `js/utils/eventIdGenerator.js`: イベントID自動生成
  - `js/services/eventService.js`: イベント管理サービス（CRUD操作）
  - `js/components/EventList.js`: イベント一覧コンポーネント
  - `js/components/EventEditor.js`: イベント編集コンポーネント
  - `js/main.js`: メインアプリケーション
  - `index.html`: メインHTML
- [x] README.mdの作成
- [x] スプレッドシートIDを固定: `1eq4xS4zzGwvv0qMCO7FGBlhDDoPsiPsU6JwRbJz_6J0`
- [x] Web App URLを設定済み
- [x] ドキュメントをdocsフォルダに整理
- [x] CORSエラー完全解決: すべてのリクエストをGET（JSONP）形式に統一
  - POSTリクエストもGET（JSONP）形式で送信
  - データはbase64エンコードしてURLパラメータとして送信
  - Google Apps Script側でbase64デコードして処理
- [x] サムネイル画像設定機能を削除（スコープ外）
  - 要件定義から削除
  - UIから削除
  - データモデルから削除
- [x] UI改善
  - インポート・エクスポート機能を削除（スコープ外）
  - イベントID入力UIを削除（自動採番のため不要）
  - 保存ボタンの動作を修正（保存完了メッセージ表示）
- [x] バグ修正
  - `eventService.js`のすべての関数を非同期に統一（`await`の追加）
  - セリフ追加ボタンのイベントハンドラーを修正（`addEventListener`を使用）
  - イベント作成時のエラー修正（`events.push is not a function`エラーを解決）
- [x] エラー修正（2025-12-27）
  - 話者の左右設定が他の設定と干渉する問題を修正
    - ラジオボタン変更後に最新データで再描画するように修正
  - 画像パスのプレースホルダーの文字色を薄くする（#999999、opacity: 0.7に変更）
  - Google Sheets APIのbase64エンコードエラーを修正（マルチバイト文字対応）
  - ローディングアニメーションを追加
    - ローディングユーティリティ関数（`js/utils/loading.js`）を作成
    - イベント編集画面の読み込み時にローディング表示
    - セリフ一覧の読み込み時にローディング表示
    - イベントタイトルの更新時にローディング表示
    - セリフ追加・削除・移動時のボタン状態表示を改善
- [x] パフォーマンス改善：ローカル保持＋保存時のみAPI呼び出し（2025-12-27）
  - 編集中のイベントデータをメモリ上に保持するように変更
  - 編集操作（セリフ追加・削除・更新、イベント名変更など）はメモリ上のデータに対して行う
  - 保存ボタンを押した時のみAPIを呼び出してGoogle Sheetsに保存
  - 未保存の変更がある場合、一覧に戻る前に警告を表示
  - 要件定義書（REQ-009）を修正して保存タイミングを明確化
  - これにより、1文字入力するたびにAPIを呼び出していた問題を解決

---

## 次回の課題・TODO

### パフォーマンス改善の確認（最優先）
- [ ] ローカル保持＋保存時のみAPI呼び出しの動作確認
  - セリフテキスト入力時にAPIリクエストが発生しないことを確認
  - 保存ボタンを押した時のみAPIが呼び出されることを確認
  - 未保存の変更がある場合の警告表示が正しく動作することを確認
  - 編集操作（セリフ追加・削除・移動、話者選択、画像パス入力）がメモリ上で正しく動作することを確認
  - 一覧に戻るボタンで未保存の変更がある場合の確認ダイアログが表示されることを確認

### Vercel環境へのデプロイ
- [x] Vercelデプロイ時のフレームワーク選択を確認（「Other」を選択）
- [ ] Vercel CLIのインストール確認
- [ ] Vercelプロジェクトの初期化
- [ ] デプロイ設定（`vercel.json`等、必要に応じて）
- [ ] 初回デプロイ実行
- [ ] 動作確認（Googleスプレッドシート連携含む）
- [ ] エラー修正（必要に応じて）

### 今後の機能追加（オプション）
- [ ] プレビュー機能の実装（REQ-012, REQ-013）
- [ ] リアルタイムプレビュー
- [ ] プレビュー実行機能
- [ ] エラーハンドリングの改善
- [ ] UI/UXの改善
- [ ] キャラ画像のファイル選択/アップロード機能
  - 現在はパス指定のみ
  - ファイル選択ダイアログまたはドラッグ&ドロップでのアップロード機能を追加
- [ ] セリフ入力セクションの生成パフォーマンス改善
  - 現在、生成に少し時間がかかっている
  - コードの最適化を検討

---

## メモ・気づき

- 既存の `pawapoke-MFver` プロジェクトを参考に、イベント作成ツールを開発する
- イベント = キャラクター + セリフ + 画像の組み合わせ
- イベントIDは選択肢キーとして使用されるため、作成後は変更不可
- イベントIDは自動生成（ランダム生成）され、ユーザーは入力不要
- データ保存方法は柔軟に対応（データベース、ローカルストレージ、ファイル）
- スマホ対応も考慮したレスポンシブデザインが必要
- Googleスプレッドシート連携の実装を完了
- フォールバック機能により、Googleスプレッドシート接続失敗時はローカルストレージを使用
- スプレッドシートIDを固定: `1eq4xS4zzGwvv0qMCO7FGBlhDDoPsiPsU6JwRbJz_6J0`
- Web App URLを設定済み
- CORS対応: すべてのリクエスト（GET/POST）をJSONP形式で処理
  - POSTデータはbase64エンコードしてURLパラメータとして送信
  - Google Apps Script側でbase64デコードして処理
- ローカル環境でのCORSエラーは解決困難なため、Vercel環境での動作確認に移行
- UI改善: インポート・エクスポート機能、イベントID入力UI、サムネイル画像設定を削除
- バグ修正: `eventService.js`の非同期処理統一、セリフ追加ボタンのイベントハンドラー修正
- Vercelデプロイ: 静的サイトのため「Other」フレームワークを選択、ビルドコマンド不要
- Favicon設定: JPEG画像をICO形式に変換（Python + Pillowを使用）
  - ICO形式は複数サイズ（16x16、32x32、48x48）を含むため、様々なデバイスで適切に表示される
  - 変換スクリプト（`convert_to_ico.py`）を作成し、今後も再利用可能

---

## 参考情報

- 既存プロジェクト: `pawapoke-MFver`
  - `js/dialogs.js` にイベントデータが定義されている
  - 各イベントは配列形式で、各要素に `text`, `speaker`, `imagePath` が含まれる

## ドキュメント一覧

- `docs/requirements.md` - 要求定義書（テスト仕様書でも参照）
- `docs/PROGRESS.md` - このファイル（進捗管理）
- `docs/README.md` - プロジェクト概要と使い方
- `docs/SETUP_GOOGLE_SHEETS.md` - Googleスプレッドシート連携セットアップガイド
- `docs/readable-code-guidelines.md` - リーダブルコードガイドライン（コード品質基準）
- `docs/design-workflow.md` - デザインワークフロー検討（Figma連携方法）
- `docs/ui-design-system.md` - UIデザインシステム（カラー、タイポグラフィ、コンポーネント等）
- `docs/google-sheets-integration.md` - Googleスプレッドシート連携の詳細説明
- `docs/CORS_FIX_GUIDE.md` - CORSエラー修正ガイド
- `docs/CORS_SOLUTION.md` - CORSエラー解決方法
- `docs/ERROR_ANALYSIS.md` - エラー分析レポート
- `docs/SPREADSHEET_ID_SETUP.md` - スプレッドシートID設定ガイド
- `docs/SPREADSHEET_INFO.md` - スプレッドシート情報

