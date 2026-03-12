# tasks/

タスク管理システムのClaude Code連携ディレクトリ。

## 構成

```
tasks/
├── .claude/commands/
│   └── define-task.md    # /define-task スキル定義
└── requirements/          # 要件定義mdファイル格納先
```

## 使い方

GASのタスク管理システムで「🤖 Claude Codeで深掘り」ボタンを押すと、`/define-task` コマンド用のテキストがクリップボードにコピーされます。

Claude Codeに貼り付けて実行すると、対話的に要件定義を深掘りし、結果を `requirements/` に保存します。
