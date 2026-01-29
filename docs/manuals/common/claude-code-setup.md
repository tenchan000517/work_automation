# Claude Code セットアップ・使い方マニュアル

WSL環境でのClaude Codeのセットアップと基本的な使い方を説明します。

---

## 1. 事前準備（初回のみ）

### 1.1 WSL（Windows Subsystem for Linux）のインストール

1. **Windows PowerShellを管理者権限で開く**
   - スタートメニューで「PowerShell」を検索
   - 「管理者として実行」を選択

2. **WSLをインストール**
   ```powershell
   wsl --install
   ```

3. **PCを再起動**

4. **Ubuntuの初期設定**
   - 再起動後、Ubuntuが自動的に開く
   - ユーザー名とパスワードを設定

### 1.2 VS Codeのインストール

1. **VS Codeをダウンロード**
   - https://code.visualstudio.com/ からダウンロード
   - インストーラーを実行

2. **WSL拡張機能をインストール**
   - VS Codeを開く
   - 左サイドバーの「拡張機能」アイコン（四角が4つ）をクリック
   - 「WSL」で検索
   - 「WSL」（Microsoft製）をインストール

### 1.3 Node.jsのインストール（WSL内）

1. **WSLターミナルを開く**
   - スタートメニューで「Ubuntu」を検索して開く

2. **nvmをインストール**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

3. **ターミナルを再起動**

4. **Node.jsをインストール**
   ```bash
   nvm install 20
   nvm use 20
   ```

### 1.4 Claude Codeのインストール

1. **WSLターミナルで以下を実行**
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **インストール確認**
   ```bash
   claude --version
   ```

---

## 2. プロジェクトのセットアップ（初回のみ）

### 2.1 プロジェクトをクローン

1. **WSLターミナルで以下を実行**
   ```bash
   cd /mnt/c/
   git clone https://github.com/your-org/sing-hp-template.git
   ```

2. **依存関係をインストール**
   ```bash
   cd sing-hp-template
   npm install
   ```

---

## 3. 日常の作業フロー

### 3.1 VS Codeでプロジェクトを開く

1. **VS Codeを起動**

2. **フォルダを開く**
   - メニュー「File」→「Open Folder...」
   - `C:\sing-hp-template` を選択
   - 「フォルダーを選択」をクリック

3. **WSLで再度開く（重要）**
   - 左下の緑色のアイコン「><」をクリック
   - 「Reopen Folder in WSL」を選択
   - ※これでWSL環境でプロジェクトが開かれます

### 3.2 ターミナルを開いてClaude Codeを起動

1. **ターミナルを開く**
   - メニュー「Terminal」→「New Terminal」
   - または `Ctrl + `` （バッククォート）

2. **Claude Codeを起動**
   ```bash
   claude
   ```

3. **初回のみ：認証**
   - ブラウザが開いてAnthropicの認証画面が表示される
   - ログインして認証を完了

### 3.3 作業前：最新の状態に更新（Pull）

**必ず作業開始前に実行してください**

Claude Codeに以下を指示：
```
git pull してください
```

### 3.4 作業の実施

Claude Codeに修正内容を指示します。

**例：**
```
ストーリー型テンプレートのヒーローセクションの背景色を#2E7D32に変更してください
```

### 3.5 作業後：変更を保存（Commit & Push）

**必ず作業完了後に実行してください**

Claude Codeに以下を指示：
```
コミットしてプッシュしてください
```

---

## 4. 作業の流れまとめ

```
VS Code起動
    ↓
フォルダを開く（C:\sing-hp-template）
    ↓
WSLで再度開く（左下の緑アイコン）
    ↓
ターミナルを開く（Ctrl + `）
    ↓
claude と入力してEnter
    ↓
「git pull してください」と指示
    ↓
修正作業を指示
    ↓
「コミットしてプッシュしてください」と指示
    ↓
完了
```

---

## 5. よく使う指示の例

### 5.1 テキスト変更
```
ストーリー型テンプレートのヒーローセクションのキャッチコピーを「あなたの可能性を、ここで。」に変更してください
```

### 5.2 色の変更
```
データ訴求型テンプレートのプライマリカラーを#1565C0に変更してください
```

### 5.3 画像の変更
```
ビジュアル型テンプレートのヒーロー画像を /images/templates/visual/new-hero.jpg に変更してください
```

### 5.4 セクションの追加・削除
```
シンプル型テンプレートにお客様の声セクションを追加してください
```

### 5.5 動作確認
```
npm run dev を実行して開発サーバーを起動してください
```

---

## 6. トラブルシューティング

### Q: Claude Codeが起動しない

**A:** Node.jsが正しくインストールされているか確認してください。
```bash
node --version
npm --version
```

### Q: WSLで開けない

**A:** VS CodeのWSL拡張機能がインストールされているか確認してください。
拡張機能タブで「WSL」を検索し、インストールされていることを確認。

### Q: git pullでエラーが出る

**A:** ローカルの変更がある可能性があります。Claude Codeに以下を指示：
```
git status を確認して、必要なら変更を破棄してください
```

### Q: プッシュでエラーが出る

**A:** 他の人の変更と競合している可能性があります。Claude Codeに以下を指示：
```
git pull してからもう一度プッシュしてください
```

---

## 7. 参考リンク

- **修正マニュアル（ケース別）**: https://sing-hp-template.vercel.app/manual
- **Claude Code公式ドキュメント**: https://docs.anthropic.com/claude-code
- **VS Code公式**: https://code.visualstudio.com/
- **WSL公式ドキュメント**: https://docs.microsoft.com/ja-jp/windows/wsl/

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-29 | 初版作成 |
