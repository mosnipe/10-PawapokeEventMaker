/**
 * イベントID生成ユーティリティ
 * ランダムなイベントIDを生成します
 */

/**
 * ランダムなイベントIDを生成
 * @returns {string} イベントID（英数字、アンダースコア、ハイフンで構成）
 */
export function generateEventId() {
  // UUID v4の簡易版を使用
  // 形式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const chars = '0123456789abcdef';
  const segments = [8, 4, 4, 4, 12];
  
  let id = '';
  segments.forEach((length, index) => {
    if (index > 0) id += '-';
    
    for (let i = 0; i < length; i++) {
      if (index === 2 && i === 0) {
        // バージョン4の識別子
        id += '4';
      } else if (index === 3 && i === 0) {
        // バリアント識別子（8, 9, a, bのいずれか）
        id += chars[Math.floor(Math.random() * 4) + 8];
      } else {
        id += chars[Math.floor(Math.random() * chars.length)];
      }
    }
  });
  
  return id;
}

/**
 * イベントIDが有効かチェック
 * @param {string} eventId - チェックするイベントID
 * @returns {boolean} 有効な場合true
 */
export function isValidEventId(eventId) {
  if (!eventId || typeof eventId !== 'string') {
    return false;
  }
  
  // 英数字、アンダースコア、ハイフンのみ許可
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(eventId) && eventId.length <= 50;
}

