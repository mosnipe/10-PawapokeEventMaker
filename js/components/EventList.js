/**
 * イベント一覧コンポーネント
 */

import { STORAGE_TYPE } from '../config.js';
import * as eventService from '../services/eventService.js';
import * as googleSheetsService from '../services/googleSheetsService.js';

// ストレージタイプに応じてサービスを選択
const service = STORAGE_TYPE === 'googleSheets' ? googleSheetsService : eventService;

/**
 * イベント一覧を表示
 * @param {Function} onEventClick - イベントクリック時のコールバック
 * @param {Function} onEventDelete - イベント削除時のコールバック
 */
export async function renderEventList(onEventClick, onEventDelete) {
  const eventListContainer = document.getElementById('eventList');
  const emptyState = document.getElementById('emptyState');
  const events = await service.getAllEvents();
  
  // 空の状態を表示/非表示
  if (events.length === 0) {
    eventListContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  eventListContainer.style.display = 'grid';
  emptyState.style.display = 'none';
  
  // 既存のカードをクリア
  eventListContainer.innerHTML = '';
  
  // イベントカードを生成
  events.forEach(event => {
    const card = createEventCard(event, onEventClick, onEventDelete);
    eventListContainer.appendChild(card);
  });
}

/**
 * イベントカードを作成
 * @param {Object} event - イベントデータ
 * @param {Function} onEventClick - クリック時のコールバック
 * @param {Function} onEventDelete - 削除時のコールバック
 * @returns {HTMLElement} イベントカード要素
 */
function createEventCard(event, onEventClick, onEventDelete) {
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
  
  // アクションボタン
  const actions = document.createElement('div');
  actions.className = 'event-card-actions';
  
  const editBtn = document.createElement('button');
  editBtn.className = 'button-primary button-sm';
  editBtn.textContent = '編集';
  editBtn.onclick = (e) => {
    e.stopPropagation();
    onEventClick(event.id);
  };
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'button-secondary button-sm';
  deleteBtn.textContent = '削除';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    onEventDelete(event.id);
  };
  
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  
  // カード全体のクリックイベント
  card.onclick = () => {
    onEventClick(event.id);
  };
  
  // 要素を組み立て
  card.appendChild(id);
  card.appendChild(name);
  card.appendChild(actions);
  
  return card;
}

