// 撮影指示テンプレート
import type { FlowStepLink } from "../../index";

/**
 * 撮影指示テンプレートを生成
 * 撮影日程確定後に撮影担当へ連絡する
 */
export function createShootingInstructionTemplate(): FlowStepLink {
  return {
    label: "連絡フォーマット",
    type: "popup",
    hasInputField: true,
    inputSectionTitle: "撮影指示フォーマット",
    inputNote: "各項目を入力してください",
    inputFields: [
      { id: "mention", label: "宛先（撮影担当）", placeholder: "@川崎", defaultValue: "@川崎" },
      { id: "cc", label: "CC", placeholder: "@青柳", defaultValue: "@青柳" },
      { id: "company", label: "企業名", placeholder: "株式会社○○" },
      { id: "shootingDate", label: "撮影日", placeholder: "○月○日（○）○○:○○〜" },
      { id: "location", label: "場所", placeholder: "○○株式会社 本社" },
      { id: "address", label: "住所", placeholder: "愛知県名古屋市○○区..." },
      { id: "interviewTarget", label: "インタビュー対象", placeholder: "代表取締役 ○○様、営業部 ○○様" },
      { id: "notes", label: "備考", placeholder: "駐車場あり、作業着撮影希望 等" },
      { id: "hearingSheetUrl", label: "ヒアリングシートURL", placeholder: "https://docs.google.com/spreadsheets/d/..." },
      { id: "folderUrl", label: "撮影素材フォルダURL", placeholder: "https://drive.google.com/..." },
    ],
    template: `{{mention}} cc:{{cc}}
{{company}}様の撮影日程が確定しましたのでご連絡します。

【撮影日】{{shootingDate}}
【場所】{{location}}
【住所】{{address}}
【インタビュー対象】{{interviewTarget}}
【備考】{{notes}}

━━━━━━━━━━━━━━━━━━━━
📁 撮影データの保存先
━━━━━━━━━━━━━━━━━━━━
撮影後、以下のフォルダに素材をアップロードしてください。
{{folderUrl}}

確認したらリアクションお願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: {{hearingSheetUrl}}
📁 撮影素材フォルダ: {{folderUrl}}`,
  };
}
