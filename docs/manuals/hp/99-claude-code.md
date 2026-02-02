# Claude Code 使い方マニュアル

HP制作で構成案プロンプトを実行する際に使用するClaude Codeの使い方を説明します。

<video controls width="100%" style="max-width: 800px; margin: 20px 0;">
  <source src="/images/hp/claude-code/intro-video.mp4" type="video/mp4">
  お使いのブラウザは動画再生に対応していません。
</video>

---

## Claude Codeとは

Claude CodeはAnthropicが提供するAIコーディングアシスタントです。ターミナル（黒い画面）で動作し、ファイルの作成・編集を自動で行います。

---

## 1. Claude Codeの立ち上げ方

### 方法A: エクスプローラーから開く（簡単）

1. **client_hp フォルダを開く**

   ![client_hpフォルダ](/images/hp/claude-code/client_hp_folder.png)

2. **企業フォルダを右クリック → 「ターミナルで開く」**

   ![右クリックメニュー](/images/hp/claude-code/right_click_menu.png)

3. **ターミナルで `claude` と入力してEnter**

   ```
   claude
   ```

   ![claude起動コマンド](/images/hp/claude-code/cd_and_claude.png)

---

### 方法B: VS Codeから開く

1. **VS Codeを起動**

   ![VS Codeメニューバー](/images/hp/claude-code/vscode_menubar.png)

2. **メニューバーが見つからない場合**

   画面左上の「...」をクリック → メニューが表示されます

   ![メニュー展開](/images/hp/claude-code/vscode_menu_expand.png)

3. **ターミナルを開く**

   メニュー → 「ターミナル」→「新しいターミナル」

   ![ターミナルメニュー](/images/hp/claude-code/vscode_terminal_menu.png)

4. **ターミナルで企業フォルダに移動して `claude` を実行**

   ```bash
   cd client_hp
   cd chubu-kensetsu-hp
   claude
   ```

   ![cdとclaude実行](/images/hp/claude-code/cd_and_claude.png)

---

### 方法C: WSL環境の場合

1. **VS Codeで Ctrl+Shift+P を押す**

2. **「WSL」と入力 →「WSL: 新しいウィンドウで WSL に接続する」を選択**

   ![WSL接続](/images/hp/claude-code/wsl_connect.png)

3. **以降は方法Bと同じ**

---

### 方法D: Git Bashから開く

1. **client_hp フォルダを右クリック →「Git Bash Here」を選択**

   ![Git Bash Here](/images/hp/claude-code/gitbash_here.png)

2. **Git Bashで `claude` と入力してEnter**

   ![Git Bashでclaude](/images/hp/claude-code/gitbash_claude.png)

3. **Claude Codeが起動します**

   ![Claude Code起動画面](/images/hp/claude-code/claude_welcome.png)

---

### 初回起動時の確認ダイアログ

初めてのフォルダでClaude Codeを起動すると、信頼確認が表示されます。

![信頼確認ダイアログ](/images/hp/claude-code/trust_dialog.png)

**「1. Yes, proceed」を選択してEnter** で続行できます。

---

## 2. Claude Codeでの実行の仕方

### STEP 1: プロンプトを貼り付ける

1. ヒアリングシートの「4. 構成案作成」メニューで生成したプロンプトをコピー
2. Claude Codeの画面に貼り付け（Ctrl+V または 右クリック→貼り付け）
3. Enterキーを押す

### STEP 2: 実行を見守る

Claude Codeが自動的に以下を実行します：

1. 作業環境の確認
2. HANDOFF.md の作成
3. wireframe/ フォルダ内に各ページのファイルを作成

![Claude Code実行中](/images/hp/claude-code/claude_running.png)

### STEP 3: 完了確認

全てのファイルが作成されると、以下のようなメッセージが表示されます。

![完了画面](/images/hp/claude-code/complete_screen.png)

「HANDOFF.mdに記載のテンプレートセットアップ手順に従い、実装を開始できます」と表示されれば完了です。

```
chubu-kensetsu/
├── HANDOFF.md
└── doc/
    └── wireframe/
        ├── 00_overview.md
        ├── 01_top.md
        ├── 02_about.md
        └── ...
```

---

## 3. Claude Codeのモードについて

画面下部にモード表示があります。`Shift+Tab` で切り替えられます。

### accept edits on（編集許可モード）

Claude Codeがファイルを編集できる状態です。通常はこのモードで使用します。

![accept edits on](/images/hp/claude-code/mode_accept_edits.png)

### plan mode on（計画モード）

Claude Codeが計画を立てるだけで、実際の編集は行わない状態です。

![plan mode on](/images/hp/claude-code/mode_plan.png)

### ショートカット一覧

`?` キーを押すとショートカット一覧が表示されます。

![ショートカットヘルプ](/images/hp/claude-code/shortcuts_help.png)

---

## 4. トラブルシューティング

### Q: 「claude」コマンドが見つからない

**原因:** Claude Codeがインストールされていない

**解決策:**
```bash
npm install -g @anthropic-ai/claude-code
```

---

### Q: Permission denied エラーが出る

**原因:** システムファイルにアクセスしようとしている（Cドライブ直下で実行など）

**解決策:**
1. 正しいフォルダ（client_hp/企業名/）に移動してから実行
2. `cd client_hp/企業名` でフォルダを移動

---

### Q: ターミナルの文字が見づらい

**解決策:** VS Codeでターミナルパネルの位置を変更

1. ターミナル部分を右クリック
2. 「パネルの位置」→「右」または「下揃え」を選択

![パネル位置変更](/images/hp/claude-code/panel_position.png)

---

### Q: メニューバーが表示されない

**解決策:** 画面左上の「...」をクリックするとメニューが表示されます

![メニュー展開](/images/hp/claude-code/vscode_menu_expand.png)

---

### Q: WSLとWindowsどちらを使えばいい？

- **Windows環境**: 特別な理由がなければこちらでOK
- **WSL環境**: 開発環境が整っている場合はこちらが高速

わからない場合は、普段使っている環境で実行してください。

---

### Q: 構成案を投げたのにファイルが保存されない

**症状:** 「ファイルとして保存しますか？」「保存先やファイル形式の指定はありません」と聞かれる

**解決策:** 以下をコピペして返答（★部分は自分で埋める）

```
はい。以下のフォルダ・ファイル構成で作成してください：

★企業名（英語）★/
├── HANDOFF.md
└── doc/
    └── wireframe/
        ├── 00_overview.md
        ├── ★構成案に含まれる各ページのmdファイル★
        ├── XX_common_parts.md
        └── XX_photo_guide.md

上の構成案の内容をもとに、各ファイルを作成してください。
```

**例:** 三河精密工業の場合
```
mikawa-seimitsu/
├── HANDOFF.md
└── doc/
    └── wireframe/
        ├── 00_overview.md
        ├── 01_top.md
        ├── 02_about.md
        ├── 03_service.md
        ├── 04_contact.md
        ├── 05_common_parts.md
        └── 06_photo_guide.md
```

---

### Q: ディレクトリを先に作ってしまった（テンプレートをクローンしていない）

**症状:** Claude Codeがテンプレートからクローンせずに、先に`mkdir`でディレクトリを作ってドキュメントを保存してしまった

**解決策:** ドキュメントを退避 → テンプレートクローン → ドキュメントを戻す

```bash
# 1. ドキュメントを一時退避
mv /mnt/c/client_hp/{{企業名英語}} /mnt/c/client_hp/{{企業名英語}}_backup

# 2. テンプレートからクローン
cd /mnt/c/client_hp
gh repo create {{企業名英語}} --template tenchan000517/sing-hp-template --clone --private

# 3. ドキュメントを戻す
cp -r /mnt/c/client_hp/{{企業名英語}}_backup/* /mnt/c/client_hp/{{企業名英語}}/

# 4. バックアップ削除
rm -rf /mnt/c/client_hp/{{企業名英語}}_backup
```

---

## 5. 補足：ターミナルの基本操作

| 操作 | コマンド |
|------|---------|
| フォルダ移動 | `cd フォルダ名` |
| 上の階層に戻る | `cd ..` |
| 現在地確認 | `pwd` |
| フォルダ内一覧 | `ls` |
| Claude Code終了 | `Ctrl + C` または `/exit` |

---

## 関連リンク

- [04-JSON出力・原稿生成](./04-JSON出力・原稿生成.md) - 構成案プロンプトの生成方法
