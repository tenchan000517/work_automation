// 日程確定報告テンプレート
import type { FlowStepLink } from "../../index";

/**
 * 日程確定報告テンプレートを生成
 * 初回打ち合わせの日程確定をワークスで共有する
 */
export function createScheduleConfirmTemplate(): FlowStepLink {
  return {
    label: "投稿フォーマット",
    type: "popup",
    hasInputField: true,
    inputSectionTitle: "ワークス投稿フォーマット",
    inputNote: "各項目を入力してください",
    inputFields: [
      { id: "mention", label: "宛先", placeholder: "@河合 cc:@青柳", defaultValue: "@河合 cc:@青柳" },
      { id: "company", label: "企業名", placeholder: "株式会社○○" },
      { id: "datetime", label: "日時", placeholder: "○月○日（○）○○:○○〜" },
      { id: "meetUrl", label: "Meet URL", placeholder: "https://meet.google.com/xxx-xxxx-xxx" },
    ],
    template: `{{mention}}
初回打ち合わせの日程が確定しました。

【企業名】{{company}}
【日時】{{datetime}}
【Meet URL】{{meetUrl}}

カレンダー登録済みです。
確認したらリアクションお願いします。`,
  };
}
