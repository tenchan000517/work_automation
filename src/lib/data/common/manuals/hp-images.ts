// HP制作用の画像セット

import type { ImageWithCaption } from "../../index";

/**
 * No.1 打ち合わせ前準備 - シート作成の画像
 */
export const HP_NO1_SHEET_IMAGES: ImageWithCaption[] = [
  { url: "/images/hp/no1/step1-form-response.png", caption: "STEP 1: フォーム回答を確認" },
  { url: "/images/hp/no1/step2-menu.png", caption: "STEP 2: メニュー「1.📋 HP制作」を開く" },
  { url: "/images/hp/no1/step2-dialog-new.png", caption: "STEP 3: 「新規ヒアリングシート作成」を選択" },
  { url: "/images/hp/no1/step2-dialog-select.png", caption: "STEP 4: フォーム回答から企業を選択" },
  { url: "/images/hp/no1/step2-dialog-complete.png", caption: "STEP 5: シート作成完了" },
  { url: "/images/hp/no1/step2-dialog-manual.png", caption: "【パターンB】手動で企業名を入力する場合" },
  { url: "/images/hp/no1/step2-sheet-upper.png", caption: "作成されたシート（上部・Part①②）" },
];

/**
 * No.1 打ち合わせ前準備 - フォルダ作成の画像
 */
export const HP_NO1_FOLDER_IMAGES: ImageWithCaption[] = [
  { url: "/images/hp/no1/step3-folder-select.png", caption: "STEP 1: メニュー「📂 企業フォルダ作成」を選択" },
  { url: "/images/hp/no1/step3-folder-options.png", caption: "STEP 2: 作成するページを選択" },
  { url: "/images/hp/no1/step3-folder-complete.png", caption: "STEP 3: フォルダ作成完了" },
  { url: "/images/hp/no1/step3-folder-result.png", caption: "作成されたフォルダ構成" },
];

/**
 * No.3 文字起こし・転記 - 文字起こし整理の画像
 * （ツナゲルの /images/transcript-*.png を共通利用）
 */
export const HP_TRANSCRIPT_IMAGES: ImageWithCaption[] = [
  { url: "/images/transcript-menu-select.png", caption: "STEP 1: メニュー「文字起こしを整理（プロンプト生成）」を選択" },
  { url: "/images/transcript-dialog.png", caption: "STEP 2: 文字起こしを貼り付け→プロンプト生成→完成版をコピー" },
  { url: "/images/transcript-ai-paste.png", caption: "STEP 3: AIに貼り付けて実行" },
  { url: "/images/transcript-ai-output.png", caption: "STEP 4: JSON形式で出力されていることを確認しコピー" },
];

/**
 * No.3 文字起こし・転記 - AI出力転記の画像
 * （ツナゲルの /images/transfer-*.png を共通利用）
 */
export const HP_TRANSFER_IMAGES: ImageWithCaption[] = [
  { url: "/images/transfer-menu-select.png", caption: "STEP 1: メニュー「AI出力を転記」を選択" },
  { url: "/images/transfer-dialog.png", caption: "STEP 2: JSON貼り付け→解析して比較" },
  { url: "/images/transfer-confirm.png", caption: "STEP 3: 内容確認→「チェック項目を転記」をクリック" },
  { url: "/images/transfer-result.png", caption: "転記完了: ヒアリングシートに反映された結果" },
];

/**
 * No.4 JSON出力・原稿生成 - 構成案作成の画像
 */
export const HP_COMPOSITION_IMAGES: ImageWithCaption[] = [
  { url: "/images/hp/menu-composition.png", caption: "STEP 1: メニュー「4.📝 構成案作成」を開く" },
  { url: "/images/hp/dialog-json-output.png", caption: "STEP 2: JSON出力ダイアログ" },
  { url: "/images/hp/dialog-composition-prompt.png", caption: "STEP 3: 構成案プロンプト生成" },
  { url: "/images/hp/dialog-claude-code.png", caption: "STEP 4: Claude Code指示文生成" },
];

/**
 * HP制作のGASメニュー画像
 */
export const HP_GAS_MENU_IMAGES: ImageWithCaption[] = [
  { url: "/images/hp/menu-hp-full.png", caption: "HP制作のGASメニュー（全体）" },
  { url: "/images/hp/menu-hp.png", caption: "「1.📋 HP制作」メニュー" },
  { url: "/images/hp/menu-hearing-hanei.png", caption: "「2.📝 ヒアリング反映」メニュー" },
  { url: "/images/hp/menu-json-output.png", caption: "「4.📝 構成案作成」メニュー" },
];

/**
 * ヒアリング反映（議事録作成）の画像
 */
export const HP_GIJIROKU_IMAGES: ImageWithCaption[] = [
  { url: "/images/hp/dialog-gijiroku.png", caption: "議事録作成ダイアログ" },
];
