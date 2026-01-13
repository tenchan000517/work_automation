// 受注連絡テンプレート
import type { FlowStepLink } from "../../index";

/**
 * 受注連絡テンプレートを生成
 * @param productName 商材名（例: "ツナゲル", "HP制作"）
 * @param defaultContractPeriod デフォルトの契約期間（例: "12ヶ月"）
 */
export function createOrderNotificationTemplate(
  productName: string,
  defaultContractPeriod: string = "12ヶ月"
): FlowStepLink {
  return {
    label: "投稿フォーマット",
    type: "popup",
    hasInputField: true,
    inputSectionTitle: "投稿フォーマット",
    inputNote: "宛先・CC・企業名を入力してください（@を付けてください）",
    inputFields: [
      { id: "mention", label: "宛先（複数可）", placeholder: "@河合 @中尾文香", defaultValue: "@河合 @中尾文香" },
      { id: "cc", label: "CC（複数可）", placeholder: "@青柳", defaultValue: "@青柳" },
      { id: "company", label: "企業名", placeholder: "株式会社○○" },
      { id: "contractPeriod", label: "契約期間", placeholder: "12ヶ月", defaultValue: defaultContractPeriod },
    ],
    template: `{{mention}} cc:{{cc}}
新規受注です。
{{company}}様、${productName}{{contractPeriod}}契約。

初回打ち合わせはカレンダーを見て調整しますので、
予定の記入漏れがある方は記入してください。

詳細は上記フォーマットをご確認ください。`,
  };
}
