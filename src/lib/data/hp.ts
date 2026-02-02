import type { Product } from "./index";
import {
  FB_REPORT_TEMPLATE,
  // NOTTA関連（ツナゲルと共通）
  NOTTA_START_IMAGES,
  NOTTA_END_IMAGES,
  NOTTA_PREP_IMAGES,
  NOTTA_LAYOUT_IMAGE,
  // GAS認証（共通）
  GAS_AUTH_IMAGES,
  // HP制作専用
  HP_NO1_SHEET_IMAGES,
  HP_NO1_FOLDER_IMAGES,
  HP_TRANSCRIPT_IMAGES,
  HP_TRANSFER_IMAGES,
  HP_COMPOSITION_IMAGES,
  HP_GAS_MENU_IMAGES,
  HP_GIJIROKU_IMAGES,
} from "./common";

export const hp: Product = {
  id: "hp",
  name: "HP制作",
  taskCount: 11,
  description: "ヒアリング、AI原稿生成、Claude Code実装、運用",
  hasOverallFlow: true,
  hasOverallManual: true,
  tasks: [
    // ==================== Phase 0: 受注・立ち上げ ====================
    {
      no: "0",
      category: "受注・立ち上げ",
      name: "受注・立ち上げ",
      assignee: "渡邉",
      nextAssignee: "河合",
      tools: "ワークス・メール・カレンダー",
      deliverable: "グループ作成・日程確定",
      checkpoint: "グループ作成・日程調整が完了しているか",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "グループ作成", summary: "LINEWORKSで企業グループを立ち上げる" },
        { label: "情報共有", summary: "企業情報をフォーマットでグループに共有" },
        { label: "日程調整", summary: "初回打ち合わせの日程を先方と調整" },
        { label: "カレンダー登録", summary: "確定した日程をカレンダーに登録" },
        { label: "ワークス共有", summary: "日程確定をグループに報告" },
        { label: "ステータス更新", summary: "ステータスを更新して次の担当者へ" },
      ],
    },
    // ==================== Phase 1: 打ち合わせ前準備 ====================
    {
      no: "1",
      category: "受注・立ち上げ",
      name: "打ち合わせ前準備",
      assignee: "河合",
      nextAssignee: "渡邉, 河合",
      tools: "スプレッドシート",
      deliverable: "ヒアリングシート作成完了",
      checkpoint: "シート作成・撮影日程調整が完了しているか",
      hasManual: true,
      issues: "",
      flowSteps: [
        {
          label: "シート作成",
          summary: "ヒアリングシートを作成",
          description: `【手順】
1. フォーム回答があるか確認
2. ヒアリングシートのメニュー「1.📋 HP制作」を開く
3. 「🆕 新規ヒアリングシート作成」を選択
4. フォーム回答から企業を選択（または手動入力）
5. シート作成完了を確認`,
          images: [...HP_NO1_SHEET_IMAGES, ...GAS_AUTH_IMAGES],
          links: [
            { label: "ヒアリングシート", type: "link", url: "https://docs.google.com/spreadsheets/d/1GO5fyOd-0lT_OMpLNw6rIZDRA6jrK4lzIAt-0tDxGvc/" }
          ]
        },
        {
          label: "フォルダ作成",
          summary: "素材用フォルダを作成",
          description: `【手順】
1. メニュー「📂 企業フォルダ作成」を選択
2. 作成するページを選択（トップ、会社概要、サービス等）
3. 「作成」をクリック
4. 作成されたフォルダを確認`,
          images: HP_NO1_FOLDER_IMAGES,
        },
        { label: "撮影日確認", summary: "撮影担当者の空き日程を確認" },
        { label: "リマインド", summary: "打ち合わせ参加者にリマインド送信" },
        {
          label: "録画準備",
          summary: "NOTTAの録画設定を確認",
          images: NOTTA_PREP_IMAGES,
          links: [
            { label: "NOTTA", type: "link", url: "https://app.notta.ai/" }
          ]
        },
        { label: "ステータス更新", summary: "ステータスを更新して次の担当者へ" },
      ],
    },
    // ==================== Phase 2: 初回打ち合わせ ====================
    {
      no: "2",
      category: "受注・立ち上げ",
      name: "初回打ち合わせ",
      assignee: "渡邉, 河合",
      nextAssignee: "河合",
      tools: "Google Meet・NOTTA",
      deliverable: "ヒアリング完了・録画データ",
      checkpoint: "必要な情報がヒアリングできているか",
      hasManual: true,
      issues: "",
      flowSteps: [
        {
          label: "NOTTA起動",
          summary: "録画・文字起こしを開始",
          description: `【NOTTA起動手順】
1. NOTTAにログイン
2. 「Web会議の文字起こし」をクリック
3. GoogleカレンダーからMeet URLをコピー
4. NOTTAにURLを貼り付け
5. MeetでNotta Botの参加を承認`,
          images: NOTTA_START_IMAGES,
          links: [
            { label: "NOTTA", type: "link", url: "https://app.notta.ai/" }
          ]
        },
        {
          label: "ヒアリング実施",
          summary: "ヒアリングシートに沿って情報収集",
          images: [NOTTA_LAYOUT_IMAGE],
        },
        { label: "撮影日程確定", summary: "撮影日程を先方と調整" },
        {
          label: "NOTTA終了",
          summary: "録画を終了し保存",
          description: `【終了手順】
1. Meetを終了（自動でNOTTAも停止）
2. AI文字起こし改善を待つ（約1分）
3. テキストでダウンロード`,
          images: NOTTA_END_IMAGES,
        },
        { label: "ステータス更新", summary: "ステータスを更新して次の担当者へ" },
      ],
    },
    // ==================== Phase 3: 文字起こし・転記 ====================
    {
      no: "3",
      category: "原稿作成",
      name: "文字起こし・転記",
      assignee: "河合",
      nextAssignee: "河合",
      tools: "NOTTA・GAS",
      deliverable: "ヒアリングシート完成",
      checkpoint: "文字起こしが正確に転記されているか",
      hasManual: true,
      issues: "",
      flowSteps: [
        {
          label: "文字起こし確認",
          summary: "NOTTAの文字起こしを確認",
          links: [
            { label: "NOTTA", type: "link", url: "https://app.notta.ai/" }
          ]
        },
        {
          label: "AI整理",
          summary: "文字起こしをAIで整理",
          description: `【手順】
1. メニュー「2.📝 ヒアリング反映」を開く
2. 「📋 文字起こしを整理（プロンプト生成）」を選択
3. 文字起こしを貼り付け→完成版をコピー
4. AIに貼り付けて実行
5. JSON形式の出力を確認しコピー`,
          images: HP_TRANSCRIPT_IMAGES,
        },
        {
          label: "GAS転記",
          summary: "AI出力をヒアリングシートに転記",
          description: `【手順】
1. メニュー「📥 AI出力を転記」を選択
2. JSON貼り付け→解析して比較
3. 内容確認→「チェック項目を転記」をクリック
4. 転記結果を確認`,
          images: HP_TRANSFER_IMAGES,
        },
        { label: "内容確認", summary: "転記内容を確認・修正" },
        { label: "ステータス更新", summary: "ステータスを更新して次の工程へ" },
      ],
    },
    // ==================== Phase 4: JSON出力・原稿生成 ====================
    {
      no: "4",
      category: "原稿作成",
      name: "JSON出力・原稿生成",
      assignee: "河合",
      nextAssignee: "河合",
      tools: "GAS・AI",
      deliverable: "HP原稿",
      checkpoint: "テンプレートに沿った原稿が生成されているか",
      hasManual: true,
      issues: "",
      flowSteps: [
        {
          label: "JSON出力",
          summary: "ヒアリングシートの内容をJSONで出力",
          description: `【手順】
1. メニュー「4.📝 構成案作成」を開く
2. 「📤 HP制作用JSON出力」を選択
3. JSON形式で出力される（自動でPart④に保存）`,
          images: [HP_COMPOSITION_IMAGES[0], HP_COMPOSITION_IMAGES[1]],
        },
        {
          label: "構成案プロンプト",
          summary: "テンプレートを選択して構成案プロンプトを生成",
          description: `【手順】
1. 「📋 構成案プロンプト生成」を選択
2. テンプレートを選択（Standard / Recruit Magazine / LeadGen等）
3. 「Claude Codeで実行する」にチェック
4. プロンプトをコピーしてAI（Claude）に貼り付け`,
          images: [HP_COMPOSITION_IMAGES[2]],
        },
        {
          label: "Claude Code指示文",
          summary: "Claude Code用の指示文を生成",
          description: `【手順】
1. 「🤖 Claude Code指示文生成」を選択
2. テンプレートを選択
3. 指示文をコピー
4. Claude Codeを起動して貼り付け`,
          images: [HP_COMPOSITION_IMAGES[3]],
        },
        { label: "原稿確認", summary: "生成された原稿を確認・修正" },
        { label: "ステータス更新", summary: "ステータスを更新して次の工程へ" },
      ],
    },
    // ==================== Phase 5: HP作成 ====================
    {
      no: "5",
      category: "実装",
      name: "HP作成",
      assignee: "河合",
      nextAssignee: "川崎",
      tools: "Claude Code・VSCode",
      deliverable: "HP（MVP）",
      checkpoint: "テンプレートからHPが正しく生成されているか",
      hasManual: true,
      issues: "",
      relatedLinks: [
        { label: "HPテンプレート", url: "https://sing-hp-template.vercel.app/", type: "site" },
        { label: "修正マニュアル", url: "https://sing-hp-template.vercel.app/manual", type: "site" },
      ],
      flowSteps: [
        { label: "テンプレート準備", summary: "HPテンプレートを準備" },
        { label: "Claude Code実行", summary: "原稿を元にHPを生成" },
        { label: "動作確認", summary: "表示崩れ・リンク切れをチェック" },
        { label: "ステータス更新", summary: "ステータスを更新して次の工程へ" },
      ],
    },
    // ==================== Phase 6: 素材撮影（オプション） ====================
    {
      no: "6",
      category: "素材撮影",
      name: "素材撮影",
      assignee: "川崎",
      nextAssignee: "河合",
      tools: "カメラ",
      deliverable: "写真・動画素材",
      checkpoint: "必要な素材が揃っているか",
      hasManual: true,
      issues: "",
      memo: `【オプションタスク】
プランによっては先方用意もあり。

パターン:
A. 撮影あり（動画）: HPの中に動画を配置
B. 撮影あり（写真）: 高解像度素材写真を配置
C. 先方用意: 先方に素材を用意してもらう`,
      flowSteps: [
        { label: "撮影準備", summary: "撮影日程・場所・必要素材を確認" },
        { label: "撮影実施", summary: "写真・動画を撮影" },
        { label: "データチェック", summary: "撮影データの品質確認" },
        { label: "データ納品", summary: "共有ドライブにアップロード" },
        { label: "ステータス更新", summary: "ステータスを更新して次の工程へ" },
      ],
    },
    // ==================== Phase 7: 修正・根拠作成 ====================
    {
      no: "7",
      category: "実装",
      name: "修正・根拠作成",
      assignee: "河合",
      nextAssignee: "河合",
      tools: "Claude Code・AI",
      deliverable: "HP（修正版）・トークスクリプト",
      checkpoint: "MVPとして先方に見せられる状態か",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "リデザイン", summary: "必要に応じてデザイン調整" },
        { label: "根拠作成", summary: "AIでデザインの意図を説明するトークスクリプトを作成" },
        { label: "最終確認", summary: "MVP完成を確認" },
        { label: "ステータス更新", summary: "ステータスを更新して次の工程へ" },
      ],
    },
    // ==================== Phase 8: MVP確認・修正 ====================
    {
      no: "8",
      category: "確認・修正",
      name: "MVP確認・修正",
      assignee: "河合",
      nextAssignee: "河合",
      tools: "メール・Google Meet",
      deliverable: "FB反映済みHP",
      checkpoint: "先方のFBが反映されているか",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "MVP送付", summary: "先方にMVPを送付" },
        { label: "FB収集", summary: "先方からフィードバックをもらう" },
        { label: "修正対応", summary: "FBを元に修正" },
        { label: "再確認", summary: "必要に応じて再度確認" },
        { label: "ステータス更新", summary: "ステータスを更新して次の工程へ" },
      ],
    },
    // ==================== Phase 9: 納品 ====================
    {
      no: "9",
      category: "納品",
      name: "納品",
      assignee: "河合",
      nextAssignee: "河合",
      tools: "メール",
      deliverable: "納品完了",
      checkpoint: "納品物が揃っているか",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "最終確認", summary: "納品物の最終チェック" },
        { label: "納品", summary: "先方に納品" },
        { label: "運用説明", summary: "今後の運用について説明" },
        { label: "ステータス更新", summary: "ステータスを更新して運用フェーズへ" },
      ],
    },
    // ==================== Phase 10: 月次FB ====================
    {
      no: "10",
      category: "運用",
      name: "月次FB",
      assignee: "河合",
      nextAssignee: "",
      tools: "資料テンプレ・Google Meet",
      deliverable: "FB資料",
      checkpoint: "指標を正しく理解し説明できるか",
      hasManual: true,
      issues: "",
      flowSteps: [
        { label: "資料作成", summary: "FB資料を作成" },
        { label: "FB実施", summary: "先方とFBミーティング" },
        { label: "次回日程確定", summary: "次回FB日程を調整" },
        { label: "議事録共有", summary: "議事録をグループに共有" },
      ],
      format: FB_REPORT_TEMPLATE,
    },
    // ==================== 補足マニュアル ====================
    {
      no: "99",
      category: "補足",
      name: "Claude Code使い方",
      assignee: "",
      nextAssignee: "",
      tools: "Claude Code・ターミナル",
      deliverable: "",
      checkpoint: "",
      hasManual: true,
      issues: "",
    },
  ],
  issues: [
    "ヒアリングシートの改善・ヒアリング精度向上",
    "GAS連携の整備（文字起こし転記、JSON出力）",
    "AIプロンプトの整備（原稿生成、トークスクリプト）",
    "Claude Codeでの実装フローの整備",
    "撮影マニュアル（オプション対応）",
  ],
};
