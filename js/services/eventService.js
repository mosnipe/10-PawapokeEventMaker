/**
 * イベント管理サービス（ローカルストレージ版）
 * イベントのCRUD操作を担当します
 * 
 * 注意: Googleスプレッドシートを使用する場合は、
 * googleSheetsService.js を使用してください。
 */

import { generateEventId } from '../utils/eventIdGenerator.js';

// ローカルストレージのキー
const STORAGE_KEY = 'pawapoke_events';

/**
 * イベントデータの構造
 * @typedef {Object} Dialog
 * @property {string} text - セリフのテキスト
 * @property {string} speaker - 話者（'left' | 'right'）
 * @property {string} imagePath - 画像パス
 */

/**
 * @typedef {Object} Event
 * @property {string} id - イベントID
 * @property {string} name - イベント名
 * @property {Dialog[]} dialogs - セリフ配列
 * @property {Date} createdAt - 作成日時
 * @property {Date} updatedAt - 更新日時
 */

/**
 * すべてのイベントを取得
 * @returns {Promise<Event[]>} イベント配列
 */
export async function getAllEvents() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    
    const events = JSON.parse(data);
    // Dateオブジェクトに変換
    return events.map(event => ({
      ...event,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt)
    }));
  } catch (error) {
    console.error('イベントの取得に失敗しました:', error);
    return [];
  }
}

/**
 * イベントIDでイベントを取得
 * @param {string} eventId - イベントID
 * @returns {Promise<Event|null>} イベント、見つからない場合はnull
 */
export async function getEventById(eventId) {
  const events = await getAllEvents();
  return events.find(event => event.id === eventId) || null;
}

/**
 * 新しいイベントを作成
 * @param {string} name - イベント名
 * @returns {Promise<Event>} 作成されたイベント
 */
export async function createEvent(name = '') {
  const event = {
    id: generateEventId(),
    name: name || '無題のイベント',
    dialogs: [
      {
        text: '',
        speaker: 'left',
        imagePath: ''
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const events = await getAllEvents();
  events.push(event);
  saveEvents(events);
  
  return event;
}

/**
 * イベントを更新
 * @param {string} eventId - イベントID
 * @param {Partial<Event>} updates - 更新内容
 * @returns {Promise<Event|null>} 更新されたイベント、見つからない場合はnull
 */
export async function updateEvent(eventId, updates) {
  const events = await getAllEvents();
  const index = events.findIndex(event => event.id === eventId);
  
  if (index === -1) {
    return null;
  }
  
  events[index] = {
    ...events[index],
    ...updates,
    id: eventId, // IDは変更不可
    updatedAt: new Date()
  };
  
  saveEvents(events);
  return events[index];
}

/**
 * イベントを削除
 * @param {string} eventId - イベントID
 * @returns {Promise<boolean>} 削除成功時true
 */
export async function deleteEvent(eventId) {
  const events = await getAllEvents();
  const filteredEvents = events.filter(event => event.id !== eventId);
  
  if (filteredEvents.length === events.length) {
    return false; // イベントが見つからなかった
  }
  
  saveEvents(filteredEvents);
  return true;
}

/**
 * セリフを追加
 * @param {string} eventId - イベントID
 * @param {number} index - 挿入位置（-1の場合は末尾）
 * @param {Dialog} dialog - セリフデータ
 * @returns {Promise<Event|null>} 更新されたイベント
 */
export async function addDialog(eventId, index = -1, dialog = null) {
  const event = await getEventById(eventId);
  if (!event) {
    return null;
  }
  
  const newDialog = dialog || {
    text: '',
    speaker: 'left',
    imagePath: ''
  };
  
  if (index === -1 || index >= event.dialogs.length) {
    event.dialogs.push(newDialog);
  } else {
    event.dialogs.splice(index, 0, newDialog);
  }
  
  return updateEvent(eventId, { dialogs: event.dialogs });
}

/**
 * セリフを更新
 * @param {string} eventId - イベントID
 * @param {number} dialogIndex - セリフのインデックス
 * @param {Partial<Dialog>} updates - 更新内容
 * @returns {Promise<Event|null>} 更新されたイベント
 */
export async function updateDialog(eventId, dialogIndex, updates) {
  const event = await getEventById(eventId);
  if (!event || dialogIndex < 0 || dialogIndex >= event.dialogs.length) {
    return null;
  }
  
  event.dialogs[dialogIndex] = {
    ...event.dialogs[dialogIndex],
    ...updates
  };
  
  return updateEvent(eventId, { dialogs: event.dialogs });
}

/**
 * セリフを削除
 * @param {string} eventId - イベントID
 * @param {number} dialogIndex - セリフのインデックス
 * @returns {Promise<Event|null>} 更新されたイベント
 */
export async function deleteDialog(eventId, dialogIndex) {
  const event = await getEventById(eventId);
  if (!event || event.dialogs.length <= 1) {
    // 最低1つのセリフは必要
    return null;
  }
  
  if (dialogIndex < 0 || dialogIndex >= event.dialogs.length) {
    return null;
  }
  
  event.dialogs.splice(dialogIndex, 1);
  return updateEvent(eventId, { dialogs: event.dialogs });
}

/**
 * セリフの順序を変更
 * @param {string} eventId - イベントID
 * @param {number} fromIndex - 移動元のインデックス
 * @param {number} toIndex - 移動先のインデックス
 * @returns {Promise<Event|null>} 更新されたイベント
 */
export async function moveDialog(eventId, fromIndex, toIndex) {
  const event = await getEventById(eventId);
  if (!event) {
    return null;
  }
  
  const dialog = event.dialogs[fromIndex];
  if (!dialog) {
    return null;
  }
  
  event.dialogs.splice(fromIndex, 1);
  event.dialogs.splice(toIndex, 0, dialog);
  
  return updateEvent(eventId, { dialogs: event.dialogs });
}

/**
 * イベントをローカルストレージに保存
 * @param {Event[]} events - イベント配列
 */
function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('イベントの保存に失敗しました:', error);
    throw new Error('イベントの保存に失敗しました');
  }
}

/**
 * dialogs.js形式にエクスポート
 * @returns {string} dialogs.js形式のコード
 */
export async function exportToDialogsJs() {
  const events = await getAllEvents();
  const dialogs = {};
  
  events.forEach(event => {
    dialogs[event.id] = event.dialogs.map(dialog => ({
      text: dialog.text,
      speaker: dialog.speaker,
      imagePath: dialog.imagePath
    }));
  });
  
  return `export const dialogs = ${JSON.stringify(dialogs, null, 2)};`;
}

/**
 * dialogs.js形式からインポート
 * @param {string} dialogsJsCode - dialogs.js形式のコード
 * @returns {number} インポートされたイベント数
 */
export async function importFromDialogsJs(dialogsJsCode) {
  try {
    // コードからオブジェクトを抽出
    const match = dialogsJsCode.match(/export\s+const\s+dialogs\s*=\s*({[\s\S]*});/);
    if (!match) {
      throw new Error('無効なdialogs.js形式です');
    }
    
    const dialogs = eval(`(${match[1]})`);
    const existingEvents = await getAllEvents();
    const existingIds = new Set(existingEvents.map(e => e.id));
    
    let importedCount = 0;
    
    Object.entries(dialogs).forEach(([eventId, dialogArray]) => {
      // 既存のイベントIDと重複しないように調整
      let finalEventId = eventId;
      if (existingIds.has(finalEventId)) {
        finalEventId = generateEventId();
      }
      
      const event = {
        id: finalEventId,
        name: `インポート: ${eventId}`,
        dialogs: dialogArray,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      existingEvents.push(event);
      existingIds.add(finalEventId);
      importedCount++;
    });
    
    saveEvents(existingEvents);
    return importedCount;
  } catch (error) {
    console.error('インポートに失敗しました:', error);
    throw error;
  }
}

