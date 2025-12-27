/**
 * メインアプリケーション
 * アプリ全体の初期化と画面遷移を管理します
 */

import { STORAGE_TYPE } from './config.js';
import * as eventService from './services/eventService.js';
import * as googleSheetsService from './services/googleSheetsService.js';
import { renderEventList } from './components/EventList.js';
import { renderEventEditor, saveCurrentEvent, hasUnsavedChangesFlag } from './components/EventEditor.js';

// ストレージタイプに応じてサービスを選択
const service = STORAGE_TYPE === 'googleSheets' ? googleSheetsService : eventService;

// 画面要素
const eventListSection = document.getElementById('eventListSection');
const eventEditorSection = document.getElementById('eventEditorSection');
const modalOverlay = document.getElementById('modalOverlay');

/**
 * アプリケーション初期化
 */
function init() {
  // イベントハンドラーを設定
  setupEventHandlers();
  
  // 初期画面を表示
  showEventList();
}

/**
 * イベントハンドラーを設定
 */
function setupEventHandlers() {
  // 新規イベント作成ボタン
  document.getElementById('createEventBtn').onclick = async () => {
    try {
      const event = await service.createEvent();
      showEventEditor(event.id);
    } catch (error) {
      showModal('エラー', `イベントの作成に失敗しました: ${error.message}`);
    }
  };
  
  // 一覧に戻るボタン
  document.getElementById('backToListBtn').onclick = () => {
    // 未保存の変更がある場合は確認
    if (hasUnsavedChangesFlag()) {
      showModal(
        '未保存の変更',
        '保存されていない変更があります。このまま一覧に戻りますか？',
        () => {
          showEventList();
        }
      );
    } else {
      showEventList();
    }
  };
  
  // 保存ボタン
  document.getElementById('saveEventBtn').onclick = async () => {
    try {
      const savedEvent = await saveCurrentEvent();
      if (savedEvent) {
        // 保存完了メッセージを表示（閉じる or 一覧に戻るの2択）
        showModal(
          '保存完了', 
          'イベントを保存しました。', 
          () => {
            // 一覧に戻る
            showEventList();
          },
          () => {
            // 閉じる（編集画面に留まる）
            // 何もしない（モーダルを閉じるだけ）
          }
        );
      } else {
        showModal('エラー', 'イベントの保存に失敗しました。');
      }
    } catch (error) {
      showModal('エラー', `保存に失敗しました: ${error.message}`);
    }
  };
  
  // モーダルのキャンセルボタン
  document.getElementById('modalCancelBtn').onclick = () => {
    if (modalCancelCallback) {
      modalCancelCallback();
    }
    hideModal();
  };
  
  // モーダルの確認ボタン
  document.getElementById('modalConfirmBtn').onclick = () => {
    if (modalCallback) {
      modalCallback();
    }
    hideModal();
  };
  
  // モーダルオーバーレイのクリックで閉じる
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) {
      hideModal();
    }
  };
}

/**
 * イベント一覧画面を表示
 */
async function showEventList() {
  eventListSection.style.display = 'block';
  eventEditorSection.style.display = 'none';
  
  try {
    await renderEventList(
      (eventId) => showEventEditor(eventId),
      async (eventId) => {
        showModal(
          'イベントの削除',
          'このイベントを削除しますか？',
          async () => {
            try {
              await service.deleteEvent(eventId);
              showEventList();
            } catch (error) {
              showModal('エラー', `イベントの削除に失敗しました: ${error.message}`);
            }
          }
        );
      }
    );
  } catch (error) {
    showModal('エラー', `イベント一覧の読み込みに失敗しました: ${error.message}`);
  }
}

/**
 * イベント編集画面を表示
 * @param {string} eventId - イベントID
 */
async function showEventEditor(eventId) {
  eventListSection.style.display = 'none';
  eventEditorSection.style.display = 'block';
  
  try {
    await renderEventEditor(eventId);
  } catch (error) {
    showModal('エラー', `イベントの読み込みに失敗しました: ${error.message}`);
    showEventList();
  }
}

let modalCallback = null;
let modalCancelCallback = null;

/**
 * モーダルを表示
 * @param {string} title - タイトル
 * @param {string} message - メッセージ
 * @param {Function} onConfirm - 確認時のコールバック
 * @param {Function} onCancel - キャンセル時のコールバック（指定時はキャンセルボタンも表示）
 */
function showModal(title, message, onConfirm = null, onCancel = null) {
  document.getElementById('modalTitle').textContent = title;
  const modalMessage = document.getElementById('modalMessage');
  if (typeof message === 'string') {
    modalMessage.textContent = message;
  } else {
    modalMessage.innerHTML = '';
    if (message) {
      modalMessage.appendChild(message);
    }
  }
  
  modalCallback = onConfirm;
  const confirmBtn = document.getElementById('modalConfirmBtn');
  const cancelBtn = document.getElementById('modalCancelBtn');
  
  if (onConfirm) {
    confirmBtn.style.display = 'inline-flex';
  } else {
    confirmBtn.style.display = 'none';
  }
  
  // キャンセルコールバックが指定されている場合は、キャンセルボタンのテキストを変更
  if (typeof onCancel === 'function') {
    cancelBtn.style.display = 'inline-flex';
    cancelBtn.textContent = '閉じる';
    modalCancelCallback = onCancel;
  } else {
    // デフォルトの動作（モーダルを閉じるだけ）
    cancelBtn.style.display = onConfirm ? 'inline-flex' : 'none';
    cancelBtn.textContent = 'キャンセル';
    modalCancelCallback = null;
  }
  
  modalOverlay.style.display = 'flex';
}

/**
 * モーダルを非表示
 */
function hideModal() {
  modalOverlay.style.display = 'none';
  modalCallback = null;
}

/**
 * インポートダイアログを表示
 */
function showImportDialog() {
  const textarea = document.createElement('textarea');
  textarea.className = 'textarea';
  textarea.placeholder = 'dialogs.js形式のコードを貼り付けてください';
  textarea.style.minHeight = '200px';
  
  const container = document.createElement('div');
  container.appendChild(textarea);
  
        showModal(
          'インポート',
          container,
          async () => {
            try {
              const code = textarea.value;
              const count = await service.importFromDialogsJs(code);
              showModal('インポート完了', `${count}件のイベントをインポートしました。`, () => {
                showEventList();
              });
            } catch (error) {
              showModal('エラー', `インポートに失敗しました: ${error.message}`);
            }
          }
        );
}

/**
 * エクスポートダイアログを表示
 */
async function showExportDialog() {
  try {
    const code = await service.exportToDialogsJs();
  const textarea = document.createElement('textarea');
  textarea.className = 'textarea';
  textarea.value = code;
  textarea.readOnly = true;
  textarea.style.minHeight = '300px';
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'button-primary';
  copyBtn.style.marginTop = 'var(--spacing-md)';
  copyBtn.textContent = 'コピー';
  copyBtn.onclick = () => {
    textarea.select();
    document.execCommand('copy');
    copyBtn.textContent = 'コピーしました！';
    setTimeout(() => {
      copyBtn.textContent = 'コピー';
    }, 2000);
  };
  
    const container = document.createElement('div');
    container.appendChild(textarea);
    container.appendChild(copyBtn);
    
    showModal('エクスポート', container);
  } catch (error) {
    showModal('エラー', `エクスポートに失敗しました: ${error.message}`);
  }
}

// アプリケーション起動
init();

