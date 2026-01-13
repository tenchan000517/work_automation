// 撮影日程確認テンプレート
import type { FlowStepLink } from "../../index";

/**
 * 撮影日程確認テンプレートを生成
 * 撮影担当に撮影可能日程を確認する
 */
export function createShootingRequestTemplate(): FlowStepLink {
  return {
    label: "連絡フォーマット",
    type: "popup",
    hasInputField: true,
    inputSectionTitle: "撮影日程確認フォーマット",
    inputNote: "各項目を入力してください",
    inputFields: [
      { id: "mention", label: "宛先（撮影担当）", placeholder: "@川崎", defaultValue: "@川崎" },
      { id: "company", label: "企業名", placeholder: "株式会社○○" },
      { id: "mtgDate", label: "初回打ち合わせ日", placeholder: "○月○日（○）" },
      { id: "hearingSheetUrl", label: "ヒアリングシートURL", placeholder: "https://docs.google.com/spreadsheets/d/..." },
      { id: "folderUrl", label: "撮影素材フォルダURL", placeholder: "https://drive.google.com/..." },
    ],
    template: `{{mention}}
{{company}}様の撮影について相談です。

初回打ち合わせ：{{mtgDate}}予定
打ち合わせで先方に撮影候補日を提示したいので、
打ち合わせ日以降で撮影可能な日程を5候補ほど教えてください。

よろしくお願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: {{hearingSheetUrl}}
📁 撮影素材フォルダ: {{folderUrl}}`,
  };
}
