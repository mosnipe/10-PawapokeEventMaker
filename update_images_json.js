/**
 * imgフォルダ内の画像ファイルをスキャンしてimages.jsonを更新するスクリプト
 * Node.jsで実行: node update_images_json.js
 */

const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'img');
const outputFile = path.join(imgDir, 'images.json');

// 画像ファイルの拡張子
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

try {
  // imgフォルダ内のファイルを読み込む
  const files = fs.readdirSync(imgDir);
  
  // 画像ファイルのみをフィルタリング（favicon.icoは除外）
  const imageFiles = files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext) && file !== 'favicon.ico';
    })
    .map(file => `./img/${file}`)
    .sort(); // アルファベット順にソート
  
  // JSONファイルに書き込む
  fs.writeFileSync(outputFile, JSON.stringify(imageFiles, null, 2), 'utf8');
  
  console.log(`✅ ${imageFiles.length}個の画像ファイルを検出しました`);
  console.log(`✅ ${outputFile} を更新しました`);
  console.log('\n検出された画像:');
  imageFiles.forEach(file => console.log(`  - ${file}`));
} catch (error) {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
}

