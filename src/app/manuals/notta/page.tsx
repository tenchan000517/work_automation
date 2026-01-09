"use client";

import Image from "next/image";
import { useState } from "react";

interface Step {
  title: string;
  description: string;
  image?: string;
  note?: string;
  link?: { url: string; label: string };
}

const steps: Step[] = [
  {
    title: "Step 1: NOTTAにログイン",
    description: "NOTTAにアクセスしてログインします。ホーム画面で「Web会議の文字起こし」をクリックします。",
    image: "/images/notta-step1-home.png",
    link: { url: "https://app.notta.ai/", label: "NOTTAを開く" },
  },
  {
    title: "Step 2: ダイアログが表示される",
    description: "「Web会議を自動文字起こしする」ダイアログが表示されます。言語設定は「1カ国語」「日本語」を確認してください。",
    image: "/images/notta-step2-dialog.png",
  },
  {
    title: "Step 3: Google MeetのURLをコピー",
    description: "Googleカレンダーを開き、該当の予定をクリックします。「Google Meetに参加する」の横にあるコピーアイコンをクリックして、URLをコピーします。",
    image: "/images/notta-step3-calendar-copy.png",
  },
  {
    title: "Step 4: NOTTAにURLを貼り付け",
    description: "「Web会議の招待URL」欄にコピーしたURLを貼り付けます。「ビデオ通話のリンク: https://meet.google.com/...」と表示されればOKです。「文字起こしする」ボタンをクリックします。",
    image: "/images/notta-step4-url-paste.png",
  },
  {
    title: "Step 5: Google Meetに入室",
    description: "Google Meetに入室すると、画面右上に「1人のゲストの参加を許可」という緑のバナーが表示されます。",
    image: "/images/notta-step6-approve-wait.png",
  },
  {
    title: "Step 6: Notta Botを承認",
    description: "「参加承認の待機中」から「Notta Bot」を見つけて「承認」をクリックします。これでNotta Botが会議に参加し、録音が開始されます。",
    image: "/images/notta-step8-approve.png",
  },
  {
    title: "Step 7: Notta Bot入室完了",
    description: "Notta Botが会議に参加すると、左側にNotta Botの画面が表示されます。これで自動文字起こしが開始されています。",
    image: "/images/notta-step5-bot-joined.png",
  },
  {
    title: "Step 8: 画面レイアウト（推奨）",
    description: "ヒアリングシート、Google Meet、NOTTAの3つを並べておくと作業しやすいです。デュアルディスプレイの場合は、カメラの下にMeet画面を配置してカメラ目線を意識してください。",
    image: "/images/notta-step10-3split.jpg",
    note: "画面は狭くなりますが3分割しておくと見やすいです（推奨・任意）",
  },
  {
    title: "Step 9: 録音中の確認",
    description: "NOTTAの画面下部に「録音中」と表示されていることを確認してください。リアルタイムで文字起こしが表示されます。",
    image: "/images/notta-step9-recording.png",
  },
  {
    title: "Step 10: ミーティング終了",
    description: "終了時はGoogle Meetを終了すれば自動的にNOTTAも停止します。「通話を終了して全員を退出させる」を選択してください。",
    image: "/images/notta-step11-end-meeting.png",
    note: "終了時はミーティングを終了すれば自動的にNOTTAも停止します",
  },
  {
    title: "Step 11: AI文字起こし改善を待つ",
    description: "録音終了後、「AIが文字起こしを改善しています...（約1分）」と表示されます。完了するまで待ちます。",
    image: "/images/notta-step12-ai-processing.png",
  },
  {
    title: "Step 12: データのダウンロード",
    description: "画面上部のダウンロードアイコンをクリックして、MP3とテキストをダウンロードしておくと安心です。",
    image: "/images/notta-step13-download.png",
    note: "mp3とテキスト両方ダウンロードしておくと安心です",
  },
];

export default function NottaManualPage() {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            NOTTAマニュアル - Web会議の文字起こし
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Google Meetの打ち合わせを自動で文字起こしする手順
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
            >
              {/* Step Header */}
              <div className="bg-cyan-50 dark:bg-cyan-900/20 px-6 py-3 border-b border-zinc-200 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-cyan-800 dark:text-cyan-200">
                  {step.title}
                </h2>
              </div>

              {/* Step Content */}
              <div className="p-6">
                <p className="text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
                  {step.description}
                </p>

                {step.link && (
                  <a
                    href={step.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 mb-4 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    {step.link.label}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}

                {step.note && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-4 py-2 mb-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {step.note}
                    </p>
                  </div>
                )}

                {step.image && (
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => setExpandedImage(step.image!)}
                  >
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={800}
                      height={500}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        クリックで拡大
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Troubleshooting Section */}
        <div className="mt-12 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="bg-red-50 dark:bg-red-900/20 px-6 py-3 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
              トラブルシューティング
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                Notta Botが入ってこない場合
              </h3>
              <ul className="text-zinc-600 dark:text-zinc-400 list-disc list-inside text-sm space-y-1">
                <li>「1人のゲストの参加を許可」の通知を見逃していないか確認</li>
                <li>NOTTAを再起動してURLを再入力</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                録音が途中で止まっていた場合
              </h3>
              <ul className="text-zinc-600 dark:text-zinc-400 list-disc list-inside text-sm space-y-1">
                <li>ヒアリングシートのメモで補完</li>
                <li>営業担当（渡邉）に確認して情報を補完</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                文字起こしが不正確な場合
              </h3>
              <ul className="text-zinc-600 dark:text-zinc-400 list-disc list-inside text-sm space-y-1">
                <li>手動で修正可能</li>
                <li>議事録作成時にAIで補完</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Link to NOTTA */}
        <div className="mt-8 text-center">
          <a
            href="https://app.notta.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
          >
            NOTTAを開く
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </main>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <Image
              src={expandedImage}
              alt="拡大画像"
              width={1600}
              height={1000}
              className="max-h-[90vh] w-auto h-auto object-contain"
            />
            <button
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
              onClick={() => setExpandedImage(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
