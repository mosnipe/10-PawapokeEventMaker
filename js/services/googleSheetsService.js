/**
 * Googleスプレッドシート連携サービス
 * Google Apps Script Web App経由でスプレッドシートにアクセスします
 */

import { GOOGLE_SCRIPT_URL, FALLBACK_TO_LOCAL } from '../config.js';
import * as localStorageService from './eventService.js';

/**
 * JSONP形式でGETリクエストを送信（CORS回避）
 * @param {string} url - リクエストURL（callbackパラメータを含む）
 * @returns {Promise<Object>} レスポンスデータ
 */
function requestJSONP(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
      delete window[callbackName];
      document.body.removeChild(script);
      if (data.success) {
        resolve(data.data);
      } else {
        reject(new Error(data.error || 'Unknown error'));
      }
    };
    
    const script = document.createElement('script');
    // URLにcallbackパラメータを追加
    const separator = url.indexOf('?') >= 0 ? '&' : '?';
    script.src = url + separator + 'callback=' + callbackName;
    script.onerror = () => {
      delete window[callbackName];
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      reject(new Error('JSONP request failed'));
    };
    document.body.appendChild(script);
  });
}

/**
 * Google Apps Script Web Appにリクエストを送信
 * すべてのリクエストをGET（JSONP）形式で送信してCORSを回避
 * @param {string} method - HTTPメソッド（GETまたはPOST、どちらもGETとして処理）
 * @param {Object} data - 送信データ（POSTの場合）
 * @returns {Promise<Object>} レスポンスデータ
 */
async function request(method, data = null) {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('Google Script URLが設定されていません。config.jsを確認してください。');
  }
  
  try {
    // すべてのリクエストをGET（JSONP）形式で送信（CORS回避）
    let url = `${GOOGLE_SCRIPT_URL}?t=${Date.now()}`;
    
    // データがある場合はURLパラメータとして追加
    if (data) {
      // データをbase64エンコードして送信（URL長さ制限を回避）
      const encodedData = btoa(JSON.stringify(data));
      url += `&data=${encodeURIComponent(encodedData)}`;
    }
    
    return await requestJSONP(url);
  } catch (error) {
    console.error('Google Sheets API error:', error);
    
    // フォールバック: ローカルストレージを使用
    if (FALLBACK_TO_LOCAL) {
      console.warn('Google Sheetsへの接続に失敗しました。ローカルストレージを使用します。');
      throw new Error('FALLBACK_TO_LOCAL');
    }
    
    throw error;
  }
}

/**
 * すべてのイベントを取得
 * @returns {Promise<Array>} イベント配列
 */
export async function getAllEvents() {
  try {
    const events = await request('GET');
    // Dateオブジェクトに変換
    return events.map(event => ({
      ...event,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt)
    }));
  } catch (error) {
    if (error.message === 'FALLBACK_TO_LOCAL') {
      return localStorageService.getAllEvents();
    }
    throw error;
  }
}

/**
 * イベントIDでイベントを取得
 * @param {string} eventId - イベントID
 * @returns {Promise<Object|null>} イベント、見つからない場合はnull
 */
export async function getEventById(eventId) {
  const events = await getAllEvents();
  return events.find(event => event.id === eventId) || null;
}

/**
 * 新しいイベントを作成
 * @param {string} name - イベント名
 * @returns {Promise<Object>} 作成されたイベント
 */
export async function createEvent(name = '') {
  const { generateEventId } = await import('../utils/eventIdGenerator.js');
  
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
  
  try {
    await request('POST', {
      action: 'create',
      event: event
    });
    return event;
  } catch (error) {
    if (error.message === 'FALLBACK_TO_LOCAL') {
      return localStorageService.createEvent(name);
    }
    throw error;
  }
}

/**
 * イベントを更新
 * @param {string} eventId - イベントID
 * @param {Object} updates - 更新内容
 * @returns {Promise<Object|null>} 更新されたイベント、見つからない場合はnull
 */
export async function updateEvent(eventId, updates) {
  try {
    const currentEvent = await getEventById(eventId);
    if (!currentEvent) {
      return null;
    }
    
    const updatedEvent = {
      ...currentEvent,
      ...updates,
      id: eventId, // IDは変更不可
      updatedAt: new Date()
    };
    
    await request('POST', {
      action: 'update',
      eventId: eventId,
      event: updatedEvent
    });
    
    return updatedEvent;
  } catch (error) {
    if (error.message === 'FALLBACK_TO_LOCAL') {
      return localStorageService.updateEvent(eventId, updates);
    }
    throw error;
  }
}

/**
 * イベントを削除
 * @param {string} eventId - イベントID
 * @returns {Promise<boolean>} 削除成功時true
 */
export async function deleteEvent(eventId) {
  try {
    await request('POST', {
      action: 'delete',
      eventId: eventId
    });
    return true;
  } catch (error) {
    if (error.message === 'FALLBACK_TO_LOCAL') {
      return localStorageService.deleteEvent(eventId);
    }
    throw error;
  }
}

/**
 * セリフを追加
 * @param {string} eventId - イベントID
 * @param {number} index - 挿入位置（-1の場合は末尾）
 * @param {Object} dialog - セリフデータ
 * @returns {Promise<Object|null>} 更新されたイベント
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
 * @param {Object} updates - 更新内容
 * @returns {Promise<Object|null>} 更新されたイベント
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
 * @returns {Promise<Object|null>} 更新されたイベント
 */
export async function deleteDialog(eventId, dialogIndex) {
  const event = await getEventById(eventId);
  if (!event || event.dialogs.length <= 1) {
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
 * @returns {Promise<Object|null>} 更新されたイベント
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
 * dialogs.js形式にエクスポート
 * @returns {Promise<string>} dialogs.js形式のコード
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
 * @returns {Promise<number>} インポートされたイベント数
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
    
    const { generateEventId } = await import('../utils/eventIdGenerator.js');
    const newEvents = [];
    
    Object.entries(dialogs).forEach(([eventId, dialogArray]) => {
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
      
      newEvents.push(event);
      existingIds.add(finalEventId);
    });
    
    // 一括保存
    if (newEvents.length > 0) {
      const allEvents = [...existingEvents, ...newEvents];
      await request('POST', {
        action: 'saveAll',
        events: allEvents
      });
    }
    
    return newEvents.length;
  } catch (error) {
    if (error.message === 'FALLBACK_TO_LOCAL') {
      return localStorageService.importFromDialogsJs(dialogsJsCode);
    }
    throw error;
  }
}

