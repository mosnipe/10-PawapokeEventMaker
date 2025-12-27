/**
 * イベントプレビューコンポーネント
 * イベントを再生して表示します（参考: pawapoke-MFver）
 */

let currentDialogIndex = 0;
let currentEvent = null;
let previewContainer = null;
let typeWriterTimer = null;
let autoAdvanceTimer = null;

/**
 * イベントをプレビュー表示（モーダル内）
 * @param {Object} event - イベントデータ
 * @param {HTMLElement} container - プレビューを表示するコンテナ要素
 */
export function renderPreviewInModal(event, container) {
  if (!event || !event.dialogs || event.dialogs.length === 0) {
    container.innerHTML = '<p>イベントデータがありません</p>';
    return;
  }
  
  currentEvent = event;
  currentDialogIndex = 0;
  previewContainer = container;
  
  // プレビューコンテナをクリア
  container.innerHTML = '';
  
  // プレビュー画面を作成
  const previewContent = createPreviewContent();
  container.appendChild(previewContent);
  
  // 最初のセリフを表示
  showDialog(0);
}

/**
 * イベントをプレビュー表示（フルスクリーン）
 * @param {Object} event - イベントデータ
 */
export function renderPreviewFullscreen(event) {
  if (!event || !event.dialogs || event.dialogs.length === 0) {
    return;
  }
  
  currentEvent = event;
  currentDialogIndex = 0;
  
  const container = document.getElementById('previewContainer');
  if (!container) {
    console.error('プレビューコンテナが見つかりません');
    return;
  }
  
  previewContainer = container;
  
  // プレビューコンテナをクリア
  container.innerHTML = '';
  
  // プレビュー画面を作成
  const previewContent = createPreviewContent();
  container.appendChild(previewContent);
  
  // 最初のセリフを表示
  showDialog(0);
}

/**
 * プレビューコンテンツを作成
 * @returns {HTMLElement} プレビューコンテンツ要素
 */
function createPreviewContent() {
  const content = document.createElement('div');
  content.className = 'preview-content';
  
  // ヘッダー（閉じるボタン、タイトル）
  const header = document.createElement('div');
  header.className = 'preview-header';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'button-secondary button-sm';
  closeBtn.textContent = '× 閉じる';
  closeBtn.onclick = () => {
    // イベントを発火して閉じる処理をmain.jsで処理
    window.dispatchEvent(new CustomEvent('closePreview'));
  };
  
  const title = document.createElement('h3');
  title.className = 'preview-title';
  title.textContent = currentEvent.name || 'イベントプレビュー';
  
  header.appendChild(closeBtn);
  header.appendChild(title);
  
  // ゲーム画面風のコンテナ
  const gameScreen = document.createElement('div');
  gameScreen.className = 'preview-game-screen';
  
  // 左側のキャラクター画像
  const leftCharacter = document.createElement('div');
  leftCharacter.className = 'preview-character preview-character-left';
  const leftImage = document.createElement('img');
  leftImage.id = 'previewLeftImage';
  leftImage.className = 'preview-character-image';
  leftImage.alt = '左キャラクター';
  leftCharacter.appendChild(leftImage);
  
  // 右側のキャラクター画像
  const rightCharacter = document.createElement('div');
  rightCharacter.className = 'preview-character preview-character-right';
  const rightImage = document.createElement('img');
  rightImage.id = 'previewRightImage';
  rightImage.className = 'preview-character-image';
  rightImage.alt = '右キャラクター';
  rightCharacter.appendChild(rightImage);
  
  // セリフ表示エリア
  const dialogArea = document.createElement('div');
  dialogArea.className = 'preview-dialog-area';
  
  const dialogBox = document.createElement('div');
  dialogBox.className = 'preview-dialog-box';
  dialogBox.id = 'previewDialogBox';
  
  const dialogText = document.createElement('p');
  dialogText.className = 'preview-dialog-text';
  dialogText.id = 'previewDialogText';
  
  dialogBox.appendChild(dialogText);
  dialogArea.appendChild(dialogBox);
  
  // 操作ボタン
  const controls = document.createElement('div');
  controls.className = 'preview-controls';
  
  const prevBtn = document.createElement('button');
  prevBtn.className = 'button-secondary button-sm';
  prevBtn.textContent = '← 前へ';
  prevBtn.id = 'previewPrevBtn';
  prevBtn.onclick = () => {
    // 自動進行を停止
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    if (currentDialogIndex > 0) {
      showDialog(currentDialogIndex - 1);
    }
  };
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'button-primary button-sm';
  nextBtn.textContent = '次へ →';
  nextBtn.id = 'previewNextBtn';
  nextBtn.onclick = () => {
    // 自動進行を停止
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    if (currentDialogIndex < currentEvent.dialogs.length - 1) {
      showDialog(currentDialogIndex + 1);
    }
  };
  
  const progress = document.createElement('div');
  progress.className = 'preview-progress';
  progress.id = 'previewProgress';
  
  controls.appendChild(prevBtn);
  controls.appendChild(progress);
  controls.appendChild(nextBtn);
  
  gameScreen.appendChild(leftCharacter);
  gameScreen.appendChild(rightCharacter);
  gameScreen.appendChild(dialogArea);
  
  content.appendChild(header);
  content.appendChild(gameScreen);
  content.appendChild(controls);
  
  return content;
}

/**
 * タイプライター風にテキストを表示（参考: pawapoke-MFver）
 * @param {string} text - 表示するテキスト
 * @param {HTMLElement} element - テキストを表示する要素
 * @param {Function} callback - 表示完了後のコールバック
 * @param {number} speed - 表示速度（ミリ秒）
 */
function typeWriter(text, element, callback, speed = 25) {
  // 既存のタイマーをクリア
  if (typeWriterTimer) {
    clearTimeout(typeWriterTimer);
  }
  
  let index = 0;
  element.innerHTML = ''; // テキストをクリア
  
  function type() {
    if (index < text.length) {
      element.innerHTML += text.charAt(index); // 1文字ずつ表示
      index++;
      typeWriterTimer = setTimeout(type, speed);
    } else if (callback) {
      callback(); // テキストの表示が終わったらコールバックを呼び出す
    }
  }
  
  type();
}

/**
 * セリフを表示
 * @param {number} index - セリフのインデックス
 */
function showDialog(index) {
  if (!currentEvent || !currentEvent.dialogs || index < 0 || index >= currentEvent.dialogs.length) {
    return;
  }
  
  // 既存のタイマーをクリア
  if (typeWriterTimer) {
    clearTimeout(typeWriterTimer);
    typeWriterTimer = null;
  }
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  
  currentDialogIndex = index;
  const dialog = currentEvent.dialogs[index];
  
  const dialogText = document.getElementById('previewDialogText');
  const dialogBox = document.getElementById('previewDialogBox');
  
  if (!dialogText || !dialogBox) {
    return;
  }
  
  // テキストボックスのクラスをリセット
  dialogBox.classList.remove('left', 'right');
  dialogBox.classList.add(dialog.speaker || 'left');
  
  // キャラクター画像を更新
  const leftImage = document.getElementById('previewLeftImage');
  const rightImage = document.getElementById('previewRightImage');
  
  if (leftImage && rightImage) {
    // 画像をリセット
    leftImage.src = '';
    leftImage.style.display = 'none';
    rightImage.src = '';
    rightImage.style.display = 'none';
    
    // 話者に応じて画像を表示
    if (dialog.imagePath) {
      if (dialog.speaker === 'left') {
        leftImage.src = dialog.imagePath;
        leftImage.style.display = 'block';
        leftImage.onerror = () => {
          leftImage.style.display = 'none';
        };
      } else if (dialog.speaker === 'right') {
        rightImage.src = dialog.imagePath;
        rightImage.style.display = 'block';
        rightImage.onerror = () => {
          rightImage.style.display = 'none';
        };
      }
    }
  }
  
  // タイプライター風にセリフを表示
  typeWriter(dialog.text || '', dialogText, () => {
    // 表示完了後、自動的に次のセリフへ進む（1秒後）
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }
    
    // 最後のセリフでない場合のみ自動進行
    if (index < currentEvent.dialogs.length - 1) {
      autoAdvanceTimer = setTimeout(() => {
        showDialog(index + 1);
      }, 1000); // 1秒後に次のセリフへ
    }
  });
  
  // ボタンの状態を更新
  const prevBtn = document.getElementById('previewPrevBtn');
  const nextBtn = document.getElementById('previewNextBtn');
  const progress = document.getElementById('previewProgress');
  
  if (prevBtn) {
    prevBtn.disabled = index === 0;
  }
  
  if (nextBtn) {
    nextBtn.disabled = index >= currentEvent.dialogs.length - 1;
  }
  
  if (progress) {
    progress.textContent = `${index + 1} / ${currentEvent.dialogs.length}`;
  }
}

/**
 * プレビューをクリーンアップ
 */
export function cleanupPreview() {
  if (typeWriterTimer) {
    clearTimeout(typeWriterTimer);
    typeWriterTimer = null;
  }
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  currentEvent = null;
  currentDialogIndex = 0;
  previewContainer = null;
}

