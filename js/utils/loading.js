/**
 * ローディング表示ユーティリティ
 */

/**
 * ローディング要素を作成
 * @param {string} text - ローディングテキスト（オプション）
 * @returns {HTMLElement} ローディング要素
 */
export function createLoading(text = '') {
  const container = document.createElement('div');
  container.className = 'loading-container';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = 'var(--spacing-sm)';
  
  const spinner = document.createElement('div');
  spinner.className = 'loading';
  
  container.appendChild(spinner);
  
  if (text) {
    const textElement = document.createElement('span');
    textElement.textContent = text;
    textElement.style.fontSize = 'var(--font-size-sm)';
    textElement.style.color = 'var(--color-text-secondary)';
    container.appendChild(textElement);
  }
  
  return container;
}

/**
 * 要素にローディングを表示
 * @param {HTMLElement} element - ローディングを表示する要素
 * @param {string} text - ローディングテキスト（オプション）
 * @returns {HTMLElement} ローディング要素
 */
export function showLoading(element, text = '') {
  const loading = createLoading(text);
  element.appendChild(loading);
  return loading;
}

/**
 * ローディングを非表示
 * @param {HTMLElement} loadingElement - ローディング要素
 */
export function hideLoading(loadingElement) {
  if (loadingElement && loadingElement.parentNode) {
    loadingElement.parentNode.removeChild(loadingElement);
  }
}

/**
 * 要素の内容をローディングに置き換える
 * @param {HTMLElement} element - 対象要素
 * @param {string} text - ローディングテキスト（オプション）
 * @returns {Function} 元の内容を復元する関数
 */
export function replaceWithLoading(element, text = '') {
  // 既存の子要素を保存
  const originalChildren = Array.from(element.childNodes);
  const loading = createLoading(text);
  
  // 既存の内容をクリアしてローディングを表示
  element.innerHTML = '';
  element.appendChild(loading);
  
  return () => {
    // ローディングを削除
    if (loading.parentNode === element) {
      element.removeChild(loading);
    }
    // 元の子要素を復元
    originalChildren.forEach(child => {
      element.appendChild(child);
    });
  };
}

