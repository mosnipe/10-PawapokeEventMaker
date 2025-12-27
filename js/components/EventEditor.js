/**
 * イベント編集コンポーネント
 */

import { STORAGE_TYPE } from '../config.js';
import * as eventService from '../services/eventService.js';
import * as googleSheetsService from '../services/googleSheetsService.js';

// ストレージタイプに応じてサービスを選択
const service = STORAGE_TYPE === 'googleSheets' ? googleSheetsService : eventService;

let currentEventId = null;
let addDialogBtnHandler = null; // イベントハンドラーを保持

/**
 * イベント編集画面を表示
 * @param {string} eventId - イベントID
 */
export async function renderEventEditor(eventId) {
  currentEventId = eventId;
  const event = await service.getEventById(eventId);
  
  if (!event) {
    console.error('イベントが見つかりません:', eventId);
    return;
  }
  
  // 基本情報を設定
  document.getElementById('eventNameInput').value = event.name;
  document.getElementById('editorTitle').textContent = `イベント編集: ${event.name}`;
  
  // イベントハンドラーを設定（先に設定）
  setupEventHandlers();
  
  // セリフ一覧を表示
  await renderDialogList(event.dialogs);
}

/**
 * セリフ一覧を表示
 * @param {Array} dialogs - セリフ配列
 */
export async function renderDialogList(dialogs) {
  const dialogList = document.getElementById('dialogList');
  if (!dialogList) {
    console.error('dialogList要素が見つかりません');
    return;
  }
  
  dialogList.innerHTML = '';
  
  for (let index = 0; index < dialogs.length; index++) {
    const dialog = dialogs[index];
    const dialogItem = await createDialogItem(dialog, index);
    dialogList.appendChild(dialogItem);
  }
  
  // セリフ一覧を再描画した後、イベントハンドラーを再設定
  setupEventHandlers();
}

/**
 * セリフアイテムを作成
 * @param {Object} dialog - セリフデータ
 * @param {number} index - インデックス
 * @returns {Promise<HTMLElement>} セリフアイテム要素
 */
async function createDialogItem(dialog, index) {
  const item = document.createElement('div');
  item.className = 'dialog-item';
  item.dataset.index = index;
  
  // ヘッダー
  const header = document.createElement('div');
  header.className = 'dialog-item-header';
  
  const number = document.createElement('div');
  number.className = 'dialog-item-number';
  number.textContent = `セリフ ${index + 1}`;
  
  const actions = document.createElement('div');
  actions.className = 'dialog-item-actions';
  
  // 現在のイベントを取得（ボタンの状態を設定するため）
  const event = await service.getEventById(currentEventId);
  if (!event) {
    throw new Error('イベントが見つかりません');
  }
  
  // 上に移動ボタン
  const moveUpBtn = document.createElement('button');
  moveUpBtn.className = 'button-secondary button-sm';
  moveUpBtn.textContent = '↑';
  moveUpBtn.disabled = index === 0;
  
  moveUpBtn.onclick = async () => {
    if (index > 0) {
      const result = await service.moveDialog(currentEventId, index, index - 1);
      if (result) {
        await renderDialogList(result.dialogs);
      }
    }
  };
  
  // 下に移動ボタン
  const moveDownBtn = document.createElement('button');
  moveDownBtn.className = 'button-secondary button-sm';
  moveDownBtn.textContent = '↓';
  moveDownBtn.disabled = index >= (event.dialogs.length - 1);
  moveDownBtn.onclick = async () => {
    if (index < event.dialogs.length - 1) {
      const result = await service.moveDialog(currentEventId, index, index + 1);
      if (result) {
        await renderDialogList(result.dialogs);
      }
    }
  };
  
  // 削除ボタン
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'button-secondary button-sm';
  deleteBtn.textContent = '削除';
  deleteBtn.disabled = event.dialogs.length <= 1;
  deleteBtn.onclick = async () => {
    if (event.dialogs.length > 1) {
      const result = await service.deleteDialog(currentEventId, index);
      if (result) {
        await renderDialogList(result.dialogs);
      }
    }
  };
  
  actions.appendChild(moveUpBtn);
  actions.appendChild(moveDownBtn);
  actions.appendChild(deleteBtn);
  
  header.appendChild(number);
  header.appendChild(actions);
  
  // コンテンツ
  const content = document.createElement('div');
  content.className = 'dialog-item-content';
  
  // テキストエリア
  const textGroup = document.createElement('div');
  textGroup.className = 'form-group dialog-item-text';
  
  const textLabel = document.createElement('label');
  textLabel.className = 'form-label';
  textLabel.textContent = 'セリフ';
  
  const textarea = document.createElement('textarea');
  textarea.className = 'textarea';
  textarea.value = dialog.text;
  textarea.placeholder = 'セリフを入力してください';
  textarea.maxLength = 1000;
  textarea.oninput = async () => {
    await service.updateDialog(currentEventId, index, { text: textarea.value });
  };
  
  textGroup.appendChild(textLabel);
  textGroup.appendChild(textarea);
  
  // 設定（話者と画像）
  const settings = document.createElement('div');
  settings.className = 'dialog-item-settings';
  
  // 話者選択
  const speakerGroup = document.createElement('div');
  speakerGroup.className = 'dialog-item-speaker';
  
  const speakerLabel = document.createElement('label');
  speakerLabel.className = 'form-label';
  speakerLabel.textContent = '話者';
  
  const speakerOptions = document.createElement('div');
  speakerOptions.className = 'speaker-options';
  
  ['left', 'right'].forEach(side => {
    const option = document.createElement('div');
    option.className = 'speaker-option';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `speaker-${index}`;
    radio.value = side;
    radio.checked = dialog.speaker === side;
    radio.onchange = async () => {
      await service.updateDialog(currentEventId, index, { speaker: side });
    };
    
    const label = document.createElement('label');
    label.textContent = side === 'left' ? '左' : '右';
    
    option.appendChild(radio);
    option.appendChild(label);
    speakerOptions.appendChild(option);
  });
  
  speakerGroup.appendChild(speakerLabel);
  speakerGroup.appendChild(speakerOptions);
  
  // 画像パス
  const imageGroup = document.createElement('div');
  imageGroup.className = 'dialog-item-image';
  
  const imageLabel = document.createElement('label');
  imageLabel.className = 'form-label';
  imageLabel.textContent = '画像パス';
  
  const imageInput = document.createElement('input');
  imageInput.type = 'text';
  imageInput.className = 'input';
  imageInput.value = dialog.imagePath || '';
  imageInput.placeholder = './img/example.gif';
  imageInput.oninput = async () => {
    await service.updateDialog(currentEventId, index, { imagePath: imageInput.value });
  };
  
  imageGroup.appendChild(imageLabel);
  imageGroup.appendChild(imageInput);
  
  settings.appendChild(speakerGroup);
  settings.appendChild(imageGroup);
  
  content.appendChild(textGroup);
  content.appendChild(settings);
  
  item.appendChild(header);
  item.appendChild(content);
  
  return item;
}

/**
 * イベントハンドラーを設定
 */
function setupEventHandlers() {
  // イベント名の変更
  const nameInput = document.getElementById('eventNameInput');
  if (nameInput) {
    // 既存のイベントハンドラーを削除してから新しいものを設定
    nameInput.oninput = null;
    nameInput.oninput = async () => {
      await service.updateEvent(currentEventId, { name: nameInput.value });
      document.getElementById('editorTitle').textContent = `イベント編集: ${nameInput.value || '無題のイベント'}`;
    };
  }
  
  // セリフ追加ボタン
  const addDialogBtn = document.getElementById('addDialogBtn');
  if (!addDialogBtn) {
    console.error('セリフ追加ボタンが見つかりません');
    return;
  }
  
  // 既存のイベントハンドラーを削除
  if (addDialogBtnHandler) {
    addDialogBtn.removeEventListener('click', addDialogBtnHandler);
  }
  
  // 新しいイベントハンドラーを作成
  addDialogBtnHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('セリフ追加ボタンがクリックされました', currentEventId);
    
    if (!currentEventId) {
      console.error('currentEventIdが設定されていません');
      alert('エラー: イベントIDが設定されていません');
      return;
    }
    
    try {
      console.log('addDialogを呼び出します', currentEventId);
      const result = await service.addDialog(currentEventId);
      console.log('addDialogの結果', result);
      
      if (result) {
        console.log('セリフ一覧を再描画します', result.dialogs);
        await renderDialogList(result.dialogs);
      } else {
        console.error('addDialogがnullを返しました');
        alert('セリフの追加に失敗しました');
      }
    } catch (error) {
      console.error('セリフの追加に失敗しました:', error);
      alert(`セリフの追加に失敗しました: ${error.message}`);
    }
  };
  
  // イベントハンドラーを追加
  addDialogBtn.addEventListener('click', addDialogBtnHandler);
  
  console.log('セリフ追加ボタンのイベントハンドラーを設定しました', addDialogBtn);
}

