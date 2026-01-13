// リマインドテンプレート
import type { FlowStepLink } from "../../index";

/**
 * 打ち合わせリマインドテンプレートを生成
 * 打ち合わせ前日に参加者へリマインドを送る
 */
export function createReminderTemplate(): FlowStepLink {
  return {
    label: "連絡フォーマット",
    type: "popup",
    hasInputField: true,
    inputSectionTitle: "リマインドフォーマット",
    inputNote: "各項目を入力してください",
    inputFields: [
      { id: "mention", label: "宛先", placeholder: "@渡邉 cc:@青柳", defaultValue: "@渡邉 cc:@青柳" },
      { id: "company", label: "企業名", placeholder: "株式会社○○" },
      { id: "datetime", label: "日時", placeholder: "○月○日（○）○○:○○〜" },
      { id: "meetUrl", label: "Meet URL", placeholder: "https://meet.google.com/xxx-xxxx-xxx" },
      { id: "hearingSheetUrl", label: "ヒアリングシートURL", placeholder: "https://docs.google.com/spreadsheets/d/..." },
      { id: "folderUrl", label: "撮影素材フォルダURL", placeholder: "https://drive.google.com/..." },
    ],
    template: `{{mention}}
{{company}}様の初回打ち合わせリマインドです。

【日時】{{datetime}}
【Meet URL】{{meetUrl}}

よろしくお願いします。

━━━━━━━━━━━━━━━━━━━━
📎 関連リンク
━━━━━━━━━━━━━━━━━━━━
📋 ヒアリングシート: {{hearingSheetUrl}}
📁 撮影素材フォルダ: {{folderUrl}}`,
  };
}
