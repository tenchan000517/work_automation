# 文字起こし整理マニュアル

NOTTAの文字起こしをAIで整理し、ヒアリング項目を抽出する手順です。

## Step 1: メニューを選択

ヒアリングシートのメニューから「**📋 文字起こしを整理（プロンプト生成）**」を選択します。

<img src="/images/transcript-menu-select.png" alt="メニュー選択" style="max-width: 400px; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

## Step 2: 文字起こしを貼り付け

ダイアログが開きます。

1. 対象企業を選択（アクティブなシートが自動選択）
2. NOTTAからコピーした文字起こしを貼り付け
3. 「💾 シートに保存」（任意）で文字起こしを保存
4. 「**完成版プロンプト**」の「コピー」ボタンをクリック

<img src="/images/transcript-dialog.png" alt="文字起こしダイアログ" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

## Step 3: AIに貼り付け

Claude または ChatGPT を開き、コピーしたプロンプトを貼り付けて送信します。

<img src="/images/transcript-ai-paste.png" alt="AIに貼り付け" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

## Step 4: JSON出力を確認

AIがヒアリング内容を**JSON形式**で出力します。この出力を全文コピーします。

<img src="/images/transcript-ai-output.png" alt="AI出力" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin: 16px 0;" />

---

次のステップ「AI出力を転記」に進みます。
