#!/usr/bin/env python3
"""
JPEG画像をICO形式に変換するスクリプト
"""
from PIL import Image
import os
import sys

def convert_jpeg_to_ico(input_path, output_path=None, sizes=[(16, 16), (32, 32), (48, 48)]):
    """
    JPEG画像をICO形式に変換
    
    Args:
        input_path: 入力JPEGファイルのパス
        output_path: 出力ICOファイルのパス（Noneの場合は自動生成）
        sizes: ICOファイルに含めるサイズのリスト
    """
    try:
        # 画像を開く
        img = Image.open(input_path)
        
        # RGBモードに変換（JPEGがRGBAの場合も対応）
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 出力パスが指定されていない場合は自動生成
        if output_path is None:
            base_name = os.path.splitext(input_path)[0]
            output_path = base_name + '.ico'
        
        # 複数サイズのICOを作成
        img.save(output_path, format='ICO', sizes=sizes)
        
        print(f"[OK] 変換完了: {input_path} -> {output_path}")
        print(f"  サイズ: {', '.join([f'{w}x{h}' for w, h in sizes])}")
        return True
        
    except Exception as e:
        print(f"[ERROR] エラー: {e}")
        return False

if __name__ == "__main__":
    input_file = "./img/pawapoke.jpg"
    output_file = "./img/favicon.ico"
    
    if not os.path.exists(input_file):
        print(f"[ERROR] エラー: ファイルが見つかりません: {input_file}")
        sys.exit(1)
    
    convert_jpeg_to_ico(input_file, output_file)

