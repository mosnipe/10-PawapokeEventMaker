/**
 * イベント編集コンポーネント
 */

import { STORAGE_TYPE } from '../config.js';
import * as eventService from '../services/eventService.js';
import * as googleSheetsService from '../services/googleSheetsService.js';
import { showLoading, hideLoading, replaceWithLoading } from '../utils/loading.js';

// ストレージタイプに応じてサービスを選択
const service = STORAGE_TYPE === 'googleSheets' ? googleSheetsService : eventService;

let currentEventId = null;
let currentEvent = null; // 編集中のイベントデータ（メモリ上に保持）
let hasUnsavedChanges = false; // 未保存の変更があるかどうか
let addDialogBtnHandler = null; // イベントハンドラーを保持

// 利用可能な画像ファイルのリスト（動的に読み込む）
let availableImages = [];

/**
 * 画像ファイルのリストを読み込む
 * @returns {Promise<Array>} 画像ファイルのリスト
 */
async function loadAvailableImages() {
  try {
    const response = await fetch('./img/images.json');
    if (!response.ok) {
      throw new Error('画像リストの読み込みに失敗しました');
    }
    const imagePaths = await response.json();
    
    // パスからファイル名を抽出してオブジェクト配列に変換
    return imagePaths.map(path => {
      const fileName = path.split('/').pop();
      return { path, name: fileName };
    });
  } catch (error) {
    console.error('画像リストの読み込みエラー:', error);
    // フォールバック: 空の配列を返す
    return [];
  }
}

/**
 * イベント編集画面を表示
 * @param {string} eventId - イベントID
 */
export async function renderEventEditor(eventId) {
  currentEventId = eventId;
  hasUnsavedChanges = false; // 未保存フラグをリセット
  
  // ローディング表示
  const editorTitle = document.getElementById('editorTitle');
  const dialogList = document.getElementById('dialogList');
  const restoreTitle = replaceWithLoading(editorTitle, '読み込み中...');
  const restoreDialogList = replaceWithLoading(dialogList, 'セリフを読み込み中...');
  
  try {
    const event = await service.getEventById(eventId);
    
    if (!event) {
      console.error('イベントが見つかりません:', eventId);
      restoreTitle();
      restoreDialogList();
      return;
    }
    
    // イベントデータをメモリに保持（ディープコピー）
    currentEvent = JSON.parse(JSON.stringify(event));
    
    // 基本情報を設定
    document.getElementById('eventNameInput').value = currentEvent.name;
    editorTitle.textContent = `イベント編集: ${currentEvent.name}`;
    
    // イベントハンドラーを設定（先に設定）
    setupEventHandlers();
    
    // セリフ一覧を表示
    renderDialogList(currentEvent.dialogs);
  } catch (error) {
    console.error('イベントの読み込みエラー:', error);
    restoreTitle();
    restoreDialogList();
    throw error;
  }
}

/**
 * 編集中のイベントデータを取得
 * @returns {Object|null} 編集中のイベントデータ
 */
export function getCurrentEvent() {
  return currentEvent;
}

/**
 * 未保存の変更があるかどうかを取得
 * @returns {boolean} 未保存の変更がある場合true
 */
export function hasUnsavedChangesFlag() {
  return hasUnsavedChanges;
}

/**
 * 編集中のイベントデータを保存
 * @returns {Promise<Object|null>} 保存されたイベントデータ
 */
export async function saveCurrentEvent() {
  if (!currentEvent || !currentEventId) {
    return null;
  }
  
  try {
    const savedEvent = await service.updateEvent(currentEventId, {
      name: currentEvent.name,
      dialogs: currentEvent.dialogs
    });
    
    // 保存成功後、メモリ上のデータを更新
    if (savedEvent) {
      currentEvent = JSON.parse(JSON.stringify(savedEvent));
      hasUnsavedChanges = false;
    }
    
    return savedEvent;
  } catch (error) {
    console.error('イベントの保存エラー:', error);
    throw error;
  }
}

/**
 * セリフ一覧を表示
 * @param {Array} dialogs - セリフ配列
 */
export function renderDialogList(dialogs) {
  const dialogList = document.getElementById('dialogList');
  if (!dialogList) {
    console.error('dialogList要素が見つかりません');
    return;
  }
  
  try {
    dialogList.innerHTML = '';
    
    for (let index = 0; index < dialogs.length; index++) {
      const dialog = dialogs[index];
      const dialogItem = createDialogItem(dialog, index);
      dialogList.appendChild(dialogItem);
    }
    
    // セリフ一覧の最後に追加ボタンを配置
    const addButtonContainer = document.createElement('div');
    addButtonContainer.className = 'dialog-list-add-button';
    addButtonContainer.style.marginTop = 'var(--spacing-md)';
    addButtonContainer.style.textAlign = 'center';
    
    const addButtonBottom = document.createElement('button');
    addButtonBottom.className = 'button-primary';
    addButtonBottom.textContent = '+ セリフを追加';
    addButtonBottom.id = 'addDialogBtnBottom';
    
    // セリフ追加処理を実行
    addButtonBottom.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleAddDialog();
    };
    
    addButtonContainer.appendChild(addButtonBottom);
    dialogList.appendChild(addButtonContainer);
    
    // セリフ一覧を再描画した後、イベントハンドラーを再設定
    setupEventHandlers();
  } catch (error) {
    console.error('セリフ一覧の読み込みエラー:', error);
    throw error;
  }
}

/**
 * セリフアイテムを作成
 * @param {Object} dialog - セリフデータ
 * @param {number} index - インデックス
 * @returns {HTMLElement} セリフアイテム要素
 */
function createDialogItem(dialog, index) {
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
  
  // メモリ上のイベントデータを使用（ボタンの状態を設定するため）
  if (!currentEvent) {
    throw new Error('イベントが見つかりません');
  }
  
  // 上に移動ボタン
  const moveUpBtn = document.createElement('button');
  moveUpBtn.className = 'button-secondary button-sm';
  moveUpBtn.textContent = '↑';
  moveUpBtn.disabled = index === 0;
  
  moveUpBtn.onclick = () => {
    if (index > 0 && currentEvent) {
      // メモリ上のデータを更新
      const dialog = currentEvent.dialogs[index];
      currentEvent.dialogs.splice(index, 1);
      currentEvent.dialogs.splice(index - 1, 0, dialog);
      hasUnsavedChanges = true;
      
      // UIを再描画
      renderDialogList(currentEvent.dialogs);
    }
  };
  
  // 下に移動ボタン
  const moveDownBtn = document.createElement('button');
  moveDownBtn.className = 'button-secondary button-sm';
  moveDownBtn.textContent = '↓';
  moveDownBtn.disabled = index >= (currentEvent.dialogs.length - 1);
  moveDownBtn.onclick = () => {
    if (index < currentEvent.dialogs.length - 1 && currentEvent) {
      // メモリ上のデータを更新
      const dialog = currentEvent.dialogs[index];
      currentEvent.dialogs.splice(index, 1);
      currentEvent.dialogs.splice(index + 1, 0, dialog);
      hasUnsavedChanges = true;
      
      // UIを再描画
      renderDialogList(currentEvent.dialogs);
    }
  };
  
  // 複製ボタン
  const duplicateBtn = document.createElement('button');
  duplicateBtn.className = 'button-secondary button-sm';
  duplicateBtn.textContent = '複製';
  duplicateBtn.onclick = () => {
    if (currentEvent && currentEvent.dialogs[index]) {
      // 現在のセリフを複製（テキスト、左右設定、画像設定を引き継ぐ）
      const duplicatedDialog = {
        text: dialog.text,
        speaker: dialog.speaker,
        imagePath: dialog.imagePath
      };
      // 現在のセリフの直後に挿入
      currentEvent.dialogs.splice(index + 1, 0, duplicatedDialog);
      hasUnsavedChanges = true;
      
      // UIを再描画
      renderDialogList(currentEvent.dialogs);
    }
  };

  // 削除ボタン
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'button-secondary button-sm';
  deleteBtn.textContent = '削除';
  deleteBtn.disabled = currentEvent.dialogs.length <= 1;
  deleteBtn.onclick = () => {
    if (currentEvent.dialogs.length > 1 && currentEvent) {
      // メモリ上のデータを更新
      currentEvent.dialogs.splice(index, 1);
      hasUnsavedChanges = true;
      
      // UIを再描画
      renderDialogList(currentEvent.dialogs);
    }
  };

  actions.appendChild(moveUpBtn);
  actions.appendChild(moveDownBtn);
  actions.appendChild(duplicateBtn);
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
  textarea.oninput = () => {
    if (currentEvent && currentEvent.dialogs[index]) {
      // メモリ上のデータを更新
      currentEvent.dialogs[index].text = textarea.value;
      hasUnsavedChanges = true;
    }
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
    radio.onchange = () => {
      if (currentEvent && currentEvent.dialogs[index]) {
        // メモリ上のデータを更新
        currentEvent.dialogs[index].speaker = side;
        hasUnsavedChanges = true;
      }
    };
    
    const label = document.createElement('label');
    label.textContent = side === 'left' ? '左' : '右';
    
    option.appendChild(radio);
    option.appendChild(label);
    speakerOptions.appendChild(option);
  });
  
  speakerGroup.appendChild(speakerLabel);
  speakerGroup.appendChild(speakerOptions);
  
  // 画像設定
  const imageGroup = document.createElement('div');
  imageGroup.className = 'dialog-item-image';

  const imageLabel = document.createElement('label');
  imageLabel.className = 'form-label';
  imageLabel.textContent = 'キャラクター画像';

  const imageButtonContainer = document.createElement('div');
  imageButtonContainer.className = 'image-button-container';
  imageButtonContainer.style.display = 'flex';
  imageButtonContainer.style.gap = 'var(--spacing-sm)';
  imageButtonContainer.style.alignItems = 'center';

  const imageButton = document.createElement('button');
  imageButton.type = 'button';
  imageButton.className = 'button-secondary button-sm';
  imageButton.textContent = dialog.imagePath ? '画像を変更' : 'キャラクター画像を設定';
  imageButton.onclick = () => {
    showImageSelector(index);
  };

  const imagePathDisplay = document.createElement('span');
  imagePathDisplay.className = 'image-path-display';
  imagePathDisplay.style.fontSize = '0.875rem';
  imagePathDisplay.style.color = 'var(--color-text-secondary)';
  imagePathDisplay.textContent = dialog.imagePath ? `選択中: ${dialog.imagePath}` : '未設定';

  imageButtonContainer.appendChild(imageButton);
  imageButtonContainer.appendChild(imagePathDisplay);

  imageGroup.appendChild(imageLabel);
  imageGroup.appendChild(imageButtonContainer);
  
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
    nameInput.oninput = () => {
      if (currentEvent) {
        // メモリ上のデータを更新
        currentEvent.name = nameInput.value;
        hasUnsavedChanges = true;
        
        // タイトルを更新
        const editorTitle = document.getElementById('editorTitle');
        editorTitle.textContent = `イベント編集: ${nameInput.value || '無題のイベント'}`;
      }
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
  
  // セリフ追加処理（共通関数）
  const handleAddDialog = () => {
    console.log('セリフ追加ボタンがクリックされました', currentEventId);
    
    if (!currentEventId) {
      console.error('currentEventIdが設定されていません');
      alert('エラー: イベントIDが設定されていません');
      return;
    }
    
    if (!currentEvent) {
      console.error('currentEventが設定されていません');
      alert('エラー: イベントデータが読み込まれていません');
      return;
    }
    
    // メモリ上のデータにセリフを追加
    const newDialog = {
      text: '',
      speaker: 'left',
      imagePath: ''
    };
    currentEvent.dialogs.push(newDialog);
    hasUnsavedChanges = true;
    
    // UIを再描画
    renderDialogList(currentEvent.dialogs);
  };
  
  // 新しいイベントハンドラーを作成
  addDialogBtnHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddDialog();
  };
  
  // イベントハンドラーを追加
  addDialogBtn.addEventListener('click', addDialogBtnHandler);
  
  console.log('セリフ追加ボタンのイベントハンドラーを設定しました', addDialogBtn);
}

/**
 * 画像選択モーダルを表示
 * @param {number} dialogIndex - セリフのインデックス
 */
async function showImageSelector(dialogIndex) {
  // モーダルオーバーレイを取得
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  
  if (!modalOverlay || !modalTitle || !modalMessage || !modalCancelBtn || !modalConfirmBtn) {
    console.error('モーダル要素が見つかりません');
    return;
  }
  
  // タイトルを設定
  modalTitle.textContent = 'キャラクター画像を選択';
  
  // ローディング表示
  modalMessage.innerHTML = '<p>画像を読み込み中...</p>';
  modalCancelBtn.style.display = 'none';
  modalConfirmBtn.style.display = 'none';
  modalOverlay.style.display = 'flex';
  
  // 画像リストを読み込む
  const images = await loadAvailableImages();
  availableImages = images;
  
  // 画像選択UIを作成
  const imageSelectorContainer = document.createElement('div');
  imageSelectorContainer.className = 'image-selector-container';
  imageSelectorContainer.style.display = 'grid';
  imageSelectorContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
  imageSelectorContainer.style.gap = 'var(--spacing-md)';
  imageSelectorContainer.style.maxHeight = '400px';
  imageSelectorContainer.style.overflowY = 'auto';
  imageSelectorContainer.style.padding = 'var(--spacing-md)';
  
  // 「画像なし」オプションを追加
  const noImageOption = document.createElement('div');
  noImageOption.className = 'image-option';
  noImageOption.style.cursor = 'pointer';
  noImageOption.style.border = '2px solid var(--color-border)';
  noImageOption.style.borderRadius = 'var(--border-radius)';
  noImageOption.style.padding = 'var(--spacing-md)';
  noImageOption.style.textAlign = 'center';
  noImageOption.style.transition = 'all 0.2s';
  
  noImageOption.onmouseenter = () => {
    noImageOption.style.borderColor = 'var(--color-primary)';
    noImageOption.style.backgroundColor = 'var(--color-bg-secondary)';
  };
  noImageOption.onmouseleave = () => {
    noImageOption.style.borderColor = 'var(--color-border)';
    noImageOption.style.backgroundColor = 'transparent';
  };
  
  const noImageLabel = document.createElement('div');
  noImageLabel.textContent = '画像なし';
  noImageLabel.style.fontSize = '0.875rem';
  noImageLabel.style.color = 'var(--color-text-secondary)';
  
  noImageOption.appendChild(noImageLabel);
  noImageOption.onclick = () => {
    selectImage(dialogIndex, '');
    hideImageSelector();
  };
  
  imageSelectorContainer.appendChild(noImageOption);
  
  // 各画像オプションを作成
  availableImages.forEach(image => {
    const imageOption = document.createElement('div');
    imageOption.className = 'image-option';
    imageOption.style.cursor = 'pointer';
    imageOption.style.border = '2px solid var(--color-border)';
    imageOption.style.borderRadius = 'var(--border-radius)';
    imageOption.style.padding = 'var(--spacing-sm)';
    imageOption.style.transition = 'all 0.2s';
    imageOption.style.display = 'flex';
    imageOption.style.flexDirection = 'column';
    imageOption.style.alignItems = 'center';
    imageOption.style.gap = 'var(--spacing-xs)';
    
    imageOption.onmouseenter = () => {
      imageOption.style.borderColor = 'var(--color-primary)';
      imageOption.style.backgroundColor = 'var(--color-bg-secondary)';
    };
    imageOption.onmouseleave = () => {
      imageOption.style.borderColor = 'var(--color-border)';
      imageOption.style.backgroundColor = 'transparent';
    };
    
    const imagePreview = document.createElement('img');
    imagePreview.src = image.path;
    imagePreview.style.width = '100%';
    imagePreview.style.height = '100px';
    imagePreview.style.objectFit = 'contain';
    imagePreview.style.borderRadius = 'var(--border-radius-sm)';
    imagePreview.onerror = () => {
      imagePreview.style.display = 'none';
    };
    
    const imageName = document.createElement('div');
    imageName.textContent = image.name;
    imageName.style.fontSize = '0.75rem';
    imageName.style.color = 'var(--color-text-secondary)';
    imageName.style.textAlign = 'center';
    imageName.style.wordBreak = 'break-word';
    
    imageOption.appendChild(imagePreview);
    imageOption.appendChild(imageName);
    imageOption.onclick = () => {
      selectImage(dialogIndex, image.path);
      hideImageSelector();
    };
    
    imageSelectorContainer.appendChild(imageOption);
  });
  
  // メッセージエリアに画像選択UIを設定
  modalMessage.innerHTML = '';
  modalMessage.appendChild(imageSelectorContainer);
  
  // ボタンを非表示（画像選択はクリックで閉じる）
  modalCancelBtn.style.display = 'none';
  modalConfirmBtn.style.display = 'none';
  
  // モーダルを表示
  modalOverlay.style.display = 'flex';
  
  // モーダルオーバーレイのクリックで閉じる
  const handleOverlayClick = (e) => {
    if (e.target === modalOverlay) {
      hideImageSelector();
      modalOverlay.removeEventListener('click', handleOverlayClick);
    }
  };
  modalOverlay.addEventListener('click', handleOverlayClick);
}

/**
 * 画像選択モーダルを非表示
 */
function hideImageSelector() {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none';
  }
}

/**
 * 画像を選択してセリフに設定
 * @param {number} dialogIndex - セリフのインデックス
 * @param {string} imagePath - 選択した画像のパス
 */
function selectImage(dialogIndex, imagePath) {
  if (!currentEvent || !currentEvent.dialogs[dialogIndex]) {
    console.error('セリフが見つかりません');
    return;
  }
  
  // メモリ上のデータを更新
  currentEvent.dialogs[dialogIndex].imagePath = imagePath;
  hasUnsavedChanges = true;
  
  // UIを再描画
  renderDialogList(currentEvent.dialogs);
}

