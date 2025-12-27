/**
 * イベント選択コンポーネント（再生用）
 */

import { STORAGE_TYPE } from '../config.js';
import * as eventService from '../services/eventService.js';
import * as googleSheetsService from '../services/googleSheetsService.js';

// ストレージタイプに応じてサービスを選択
const service = STORAGE_TYPE === 'googleSheets' ? googleSheetsService : eventService;

/**
 * イベント選択一覧を表示
 * @param {Function} onEventSelect - イベント選択時のコールバック
 */
export async function renderEventSelect(onEventSelect) {
  const eventSelectList = document.getElementById('eventSelectList');
  const emptyState = document.getElementById('emptyStateSelect');
  const events = await service.getAllEvents();
  
  // 空の状態を表示/非表示
  if (events.length === 0) {
    eventSelectList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  eventSelectList.style.display = 'grid';
  emptyState.style.display = 'none';
  
  // 既存のカードをクリア
  eventSelectList.innerHTML = '';
  
  // イベントカードを生成
  events.forEach(event => {
    const card = createEventSelectCard(event, onEventSelect);
    eventSelectList.appendChild(card);
  });
}

/**
 * イベント選択カードを作成
 * @param {Object} event - イベントデータ
 * @param {Function} onEventSelect - 選択時のコールバック
 * @returns {HTMLElement} イベントカード要素
 */
function createEventSelectCard(event, onEventSelect) {
  const card = document.createElement('div');
  card.className = 'event-card';
  card.dataset.eventId = event.id;
  
  // イベントID
  const id = document.createElement('div');
  id.className = 'event-card-id';
  id.textContent = `ID: ${event.id}`;
  
  // イベント名
  const name = document.createElement('div');
  name.className = 'event-card-name';
  name.textContent = event.name;
  
  // セリフ数
  const dialogCount = document.createElement('div');
  dialogCount.className = 'event-card-dialog-count';
  dialogCount.textContent = `セリフ数: ${event.dialogs ? event.dialogs.length : 0}`;
  
  // 再生ボタン
  const playBtn = document.createElement('button');
  playBtn.className = 'button-primary button-sm';
  playBtn.textContent = '▶ 再生';
  playBtn.onclick = (e) => {
    e.stopPropagation();
    onEventSelect(event);
  };
  
  // カード全体のクリックイベント
  card.onclick = () => {
    onEventSelect(event);
  };
  
  // 要素を組み立て
  card.appendChild(id);
  card.appendChild(name);
  card.appendChild(dialogCount);
  card.appendChild(playBtn);
  
  return card;
}

