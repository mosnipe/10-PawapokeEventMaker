// スプレッドシートのID（固定）
const SPREADSHEET_ID = '1eq4xS4zzGwvv0qMCO7FGBlhDDoPsiPsU6JwRbJz_6J0';

// シート名
const SHEET_NAME = 'Events';

/**
 * GET: すべてのリクエストを処理
 * JSONP形式で返す（callbackパラメータが必須）
 * データはURLパラメータ（data）から取得
 */
function doGet(e) {
  try {
    const sheet = getSheet();
    let result;
    
    // データパラメータがある場合は、POST操作として処理
    const dataParam = e.parameter.data;
    if (dataParam) {
      // base64デコード（URLデコード済みのデータをデコード）
      const decodedData = Utilities.base64Decode(dataParam);
      const dataString = Utilities.newBlob(decodedData).getDataAsString('UTF-8');
      const data = JSON.parse(dataString);
      const action = data.action;
      
      switch (action) {
        case 'create':
          result = createEvent(sheet, data.event);
          break;
        case 'update':
          result = updateEvent(sheet, data.eventId, data.event);
          break;
        case 'delete':
          result = deleteEvent(sheet, data.eventId);
          break;
        case 'saveAll':
          result = saveAllEvents(sheet, data.events);
          break;
        default:
          throw new Error('Unknown action: ' + action);
      }
      
      result = {
        success: true,
        data: result
      };
    } else {
      // データパラメータがない場合は、すべてのイベントを取得
      const events = getAllEvents(sheet);
      result = {
        success: true,
        data: events
      };
    }
    
    // JSONP形式で返す（callbackパラメータが必須）
    const callback = e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // callbackがない場合はエラー
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'callback parameter is required'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    const result = {
      success: false,
      error: error.toString()
    };
    
    const callback = e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST: 後方互換性のため残すが、実際には使用しない
 * すべてのリクエストはdoGetで処理される
 */
function doPost(e) {
  // doGetにリダイレクト（後方互換性のため）
  return doGet(e);
}

/**
 * シートを取得（存在しない場合は作成）
 */
function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    // ヘッダー行を設定
    sheet.getRange(1, 1, 1, 6).setValues([[
      'id', 'name', 'thumbnail', 'dialogs', 'createdAt', 'updatedAt'
    ]]);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  
  return sheet;
}

/**
 * すべてのイベントを取得
 */
function getAllEvents(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return [];
  }
  
  const events = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    events.push({
      id: row[0],
      name: row[1],
      thumbnail: row[2] || '',
      dialogs: JSON.parse(row[3] || '[]'),
      createdAt: row[4],
      updatedAt: row[5]
    });
  }
  
  return events;
}

/**
 * イベントを作成
 */
function createEvent(sheet, event) {
  const row = [
    event.id,
    event.name,
    event.thumbnail || '',
    JSON.stringify(event.dialogs || []),
    new Date(),
    new Date()
  ];
  
  sheet.appendRow(row);
  return event;
}

/**
 * イベントを更新
 */
function updateEvent(sheet, eventId, event) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === eventId) {
      sheet.getRange(i + 1, 2, 1, 5).setValues([[
        event.name,
        event.thumbnail || '',
        JSON.stringify(event.dialogs || []),
        data[i][4], // createdAtは変更しない
        new Date()  // updatedAtを更新
      ]]);
      return { ...event, id: eventId };
    }
  }
  
  throw new Error('Event not found: ' + eventId);
}

/**
 * イベントを削除
 */
function deleteEvent(sheet, eventId) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === eventId) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  
  return false;
}

/**
 * すべてのイベントを一括保存（既存データを置き換え）
 */
function saveAllEvents(sheet, events) {
  // ヘッダー以外のデータを削除
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // 新しいデータを追加
  if (events.length > 0) {
    const rows = events.map(event => [
      event.id,
      event.name,
      event.thumbnail || '',
      JSON.stringify(event.dialogs || []),
      event.createdAt || new Date(),
      event.updatedAt || new Date()
    ]);
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
  
  return events;
}

