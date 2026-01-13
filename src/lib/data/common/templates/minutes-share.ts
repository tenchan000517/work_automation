// 議事録共有テンプレート
import type { FlowStepLink } from "../../index";

/**
 * 議事録共有テンプレートを生成
 * 打ち合わせ後に議事録をワークスで共有する
 */
export function createMinutesShareTemplate(): FlowStepLink {
  return {
    label: "投稿フォーマット",
    type: "popup",
    hasInputField: true,
    inputSectionTitle: "ワークス投稿フォーマット",
    inputNote: "企業名と議事録を入力してください",
    inputFields: [
      { id: "company", label: "企業名", placeholder: "株式会社○○" },
      { id: "shootingMention", label: "撮影担当メンション", placeholder: "@川崎", defaultValue: "@川崎" },
      { id: "minutes", label: "議事録", placeholder: "AIが出力した議事録をここに貼り付け...", type: "textarea", rows: 10 },
      { id: "hearingSheetUrl", label: "ヒアリングシートURL", placeholder: "https://docs.google.com/spreadsheets/d/..." },
      { id: "folderUrl", label: "撮影素材フォルダURL", placeholder: "https://drive.google.com/..." },
    ],
    template: `@ALL {{shootingMention}}
{{company}}様 初回打ち合わせの議事録を共有します。

{{minutes}}

ご確認お願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: {{hearingSheetUrl}}
📁 撮影素材フォルダ: {{folderUrl}}`,
  };
}
