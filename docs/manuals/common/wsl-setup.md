# WSL環境構築マニュアル（完全版）

このマニュアルでは、WindowsパソコンにWSL（Windows Subsystem for Linux）環境を構築し、Claude Codeを使えるようにするまでの手順を、全くの初心者でもわかるように解説します。

---

## 目次

1. [WSLとは？なぜ必要？](#1-wslとはなぜ必要)
2. [事前確認](#2-事前確認)
3. [BIOS設定：仮想化を有効にする](#3-bios設定仮想化を有効にする)
4. [WSLとUbuntuをインストールする](#4-wslとubuntuをインストールする)（⚠つまづきやすい）
5. [VS Codeをインストールする](#5-vs-codeをインストールする)
6. [VS CodeにWSL拡張機能を追加する](#6-vs-codeにwsl拡張機能を追加する)
7. [Node.jsをインストールする](#7-nodejsをインストールする)
8. [Claude Codeをインストールする](#8-claude-codeをインストールする)
9. [動作確認](#9-動作確認)
10. [トラブルシューティング](#10-トラブルシューティング)（大幅充実）

---

## 1. WSLとは？なぜ必要？

### WSLとは

**WSL（Windows Subsystem for Linux）** は、Windows上でLinux環境を動かすための仕組みです。

### なぜ必要なのか

- Claude Codeは**Linux環境**で動作するように設計されています
- WSLを使うことで、Windowsパソコンでも快適にClaude Codeを使えます
- 開発ツールの多くはLinux向けに作られているため、WSLがあると便利です

---

## 2. 事前確認

WSLをインストールする前に、2つの項目を確認します。

### 2-1. Windowsのバージョンを確認する

WSLには **Windows 10 バージョン2004以降** または **Windows 11** が必要です。

1. キーボードで `Win + R` を同時に押す
2. `winver` と入力してEnterキーを押す
3. 表示されたウィンドウで確認

```
┌──────────────────────────────────────┐
│  Windows の仕様                       │
│                                      │
│  エディション: Windows 11 Pro         │
│  バージョン: 24H2  ← ここを確認       │
│  OSビルド: 26100.xxxx                │
└──────────────────────────────────────┘
```

- **Windows 11** → OK（どのバージョンでも可）
- **Windows 10 バージョン2004以降** → OK
- **Windows 10 バージョン1909以前** → Windows Updateで最新にしてから再確認

> **新しいPCなら問題ありません。** 2020年以降に購入したPCであれば、ほぼ確実にバージョン要件を満たしています。

### 2-2. 仮想化が有効か確認する

WSLを使うには、パソコンの「仮想化機能」が有効になっている必要があります。

#### 確認手順

1. **タスクマネージャーを開く**
   - キーボードで `Ctrl + Shift + Esc` を同時に押す
   - または、タスクバーを右クリック →「タスクマネージャー」

2. **パフォーマンスタブを開く**
   - 上部の「パフォーマンス」タブをクリック
   - 左側の「CPU」をクリック

3. **仮想化の状態を確認**
   - 右下に「仮想化」という項目があります
   - 「**有効**」と表示されていれば → [4. WSLをインストールする](#4-wslをインストールする) に進む
   - 「**無効**」と表示されていれば → [3. BIOS設定](#3-bios設定仮想化を有効にする) に進む

```
┌─────────────────────────────────────┐
│  パフォーマンス  │  CPU            │
├─────────────────────────────────────┤
│                                     │
│  基本速度: 2.90 GHz                 │
│  ソケット: 1                         │
│  コア数: 8                           │
│  論理プロセッサ数: 16                │
│                                     │
│  仮想化: 有効  ← ここを確認！        │
│                                     │
└─────────────────────────────────────┘
```

---

## 3. BIOS設定：仮想化を有効にする

> **注意**: この手順はパソコンの設定を変更するため、慎重に行ってください。不安な場合は詳しい人に相談してください。

### BIOS画面への入り方

パソコンのメーカーによって方法が異なります。

#### 方法1: Windowsの設定から入る（推奨）

1. **スタートメニュー → 設定（歯車アイコン）**

2. **「システム」→「回復」**

3. **「今すぐ再起動」をクリック**
   - 「PC の起動をカスタマイズする」の横にあるボタン

4. **「トラブルシューティング」を選択**

5. **「詳細オプション」を選択**

6. **「UEFI ファームウェアの設定」を選択**

7. **「再起動」をクリック**
   - BIOS画面が開きます

#### 方法2: 起動時にキーを押す

パソコンの電源を入れた直後に、特定のキーを連打します。

| メーカー | 押すキー |
|---------|---------|
| Dell | F2 |
| HP | F10 または Esc |
| Lenovo | F1 または F2 |
| ASUS | F2 または Del |
| Acer | F2 または Del |
| Microsoft Surface | 音量＋ボタンを押しながら電源ON |

### BIOS画面での設定

> **メーカーによって画面や項目名が異なります**

1. **仮想化設定を探す**

   以下のような名前の項目を探してください：
   - **Intel製CPU**: 「Intel Virtualization Technology」「Intel VT-x」「VT-x」
   - **AMD製CPU**: 「SVM Mode」「AMD-V」「Secure Virtual Machine」

   よくある場所：
   - 「Advanced」タブ
   - 「CPU Configuration」
   - 「Security」タブ

2. **設定を有効にする**
   - 該当項目を選択
   - 「Enabled」に変更

3. **保存して終了**
   - 「Save & Exit」を選択
   - または「F10」キーを押して保存

4. **Windowsが起動したら、[2. 事前確認](#2-事前確認仮想化が有効か確認する) に戻って確認**

---

## 4. WSLとUbuntuをインストールする

### ステップ1: PowerShellを管理者権限で開く

1. **スタートメニューで「PowerShell」と検索**
2. **「Windows PowerShell」を右クリック**
3. **「管理者として実行」を選択**
4. **「このアプリがデバイスに変更を加えることを許可しますか？」→「はい」**

```
┌─────────────────────────────┐
│ 🔍 PowerShell              │
├─────────────────────────────┤
│ Windows PowerShell         │
│   右クリック →              │
│   「管理者として実行」       │
└─────────────────────────────┘
```

> **ポイント**: 「管理者として実行」しないとインストールが失敗します。
> PowerShellのタイトルバーに「管理者:」と表示されていることを確認してください。

### ステップ2: WSLをインストール

以下のコマンドをコピーして貼り付け、Enterキーを押します：

```powershell
wsl --install
```

#### インストール中の画面例

```
インストール中: 仮想マシン プラットフォーム
仮想マシン プラットフォーム はインストールされました。
インストール中: Linux 用 Windows サブシステム
Linux 用 Windows サブシステム はインストールされました。
インストール中: Ubuntu
Ubuntu はインストールされました。
要求された操作は正常に終了しました。変更を有効にするには、システムを再起動する必要があります。
```

> **3〜10分ほどかかります。** 途中で画面が動かなくなっても閉じないでください。

### ステップ3: パソコンを再起動する

インストール完了メッセージが表示されたら、再起動します：

```powershell
shutdown /r /t 0
```

または、スタートメニュー →電源アイコン →「再起動」でもOKです。

---

### ステップ4: Ubuntuの初期セットアップ

再起動後、Ubuntuのセットアップ画面が表示されます。**ここが最もつまづきやすいポイントです。**

#### 4-A. Ubuntuが自動的に開く場合

再起動後、黒い画面（ターミナル）が自動で開き、以下のようなメッセージが表示されます：

```
Installing, this may take a few minutes...
Please create a default UNIX user account. The username does not need to match your Windows username.
For more information visit: https://aka.ms/wslusers
Enter new UNIX username:
```

→ この画面が出たら、[4-C. ユーザー名を設定する](#4-c-ユーザー名を設定する) に進んでください。

#### 4-B. Ubuntuが自動的に開かない場合

以下の方法で手動で開きます：

**方法1: スタートメニューから開く**
1. スタートメニューで「**Ubuntu**」と検索
2. 「Ubuntu」をクリック

**方法2: Ubuntuがスタートメニューにない場合**

`wsl --install` でUbuntuが一緒にインストールされなかったケースです。以下を実行します：

1. **Microsoft Storeを開く**
   - スタートメニューで「Microsoft Store」と検索して開く

2. **Ubuntuを検索**
   - Store上部の検索ボックスに「Ubuntu」と入力

3. **「Ubuntu」をインストール**
   - **「Ubuntu」**（バージョン番号なし、またはUbuntu 24.04 LTS）を選択
   - 「入手」または「インストール」をクリック
   - ダウンロードとインストールが完了するまで待つ

4. **「開く」をクリック**

```
┌─────────────────────────────────────┐
│  Microsoft Store                    │
│                                     │
│  🔍 Ubuntu                         │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  Ubuntu                        │ │
│  │  Canonical Group Limited       │ │
│  │  ★★★★☆                        │ │
│  │  [入手]  ← クリック            │ │
│  └────────────────────────────────┘ │
│                                     │
│  ※「Ubuntu 24.04 LTS」でもOK      │
│  ※ 数字付き（22.04等）でも問題なし  │
└─────────────────────────────────────┘
```

**方法3: PowerShellからインストール**

Microsoft Storeが使えない場合、PowerShell（管理者）で：

```powershell
wsl --install -d Ubuntu
```

#### 4-C. ユーザー名を設定する

```
Enter new UNIX username:
```

半角英小文字で名前を入力します。

**ユーザー名のルール：**

| OK | NG | 理由 |
|----|-----|------|
| `taro` | `Taro` | 大文字は使えない |
| `yamada` | `山田` | 日本語は使えない |
| `taro123` | `taro yamada` | スペースは使えない |
| `t-yamada` | `1taro` | 数字始まりはNG |

> **おすすめ**: 自分の名前をローマ字で（例: `taro`、`hanako`、`yamada`）

入力したらEnterキーを押します。

#### 4-D. パスワードを設定する

```
New password:
```

パスワードを入力してEnterキーを押します。

> **⚠ 重要: パスワードは画面に表示されません！**
> キーを押しても何も表示されませんが、ちゃんと入力されています。
> これはLinuxのセキュリティ仕様です。「壊れている」わけではありません。

```
Retype new password:
```

同じパスワードをもう一度入力してEnterキーを押します。

**パスワード設定のコツ：**
- 短くてもOK（例: `pass1234`）— 自分のPC内だけで使うので複雑にしすぎなくて大丈夫
- 入力中は文字が見えないので、**ゆっくり正確に**打つ
- 2回目の入力が一致しないと `Sorry, passwords do not match.` と表示されてやり直しになる
- もし何度もやり直しになる場合は、まずメモ帳にパスワードを打ってから、コピー＆ペーストする（右クリックで貼り付け）

#### 4-E. セットアップ完了

以下のような画面が表示されれば成功です：

```
Installation successful!
To run a command as administrator (root), use "sudo <command>".
See "man sudo_root" for details.

Welcome to Ubuntu 24.04.x LTS (GNU/Linux 5.15.xxx-microsoft-standard-WSL2 x86_64)

taro@PC-NAME:~$
```

`ユーザー名@PC名:~$` という表示（プロンプト）が出ていれば、Ubuntuが使える状態です。

---

### ステップ5: WSL2で動いているか確認する

Ubuntuのセットアップが完了したら、WSL2で動いていることを確認します。

**PowerShell**（Ubuntuではなく）で以下を実行します：

```powershell
wsl -l -v
```

**正常な出力例：**
```
  NAME      STATE           VERSION
* Ubuntu    Running         2
```

- **VERSION が「2」** → OK！ そのまま進んでください
- **VERSION が「1」** → WSL2に変換が必要です。以下を実行：

```powershell
wsl --set-version Ubuntu 2
```

> **変換には数分かかります。** 完了メッセージが出るまで待ってください。

---

### ステップ6: Ubuntuを最新の状態にする

Ubuntuを開いて、以下のコマンドを実行します。（初回は必ず実行してください）

```bash
sudo apt update && sudo apt upgrade -y
```

- `sudo` を使うとパスワードの入力を求められます（先ほど設定したパスワード）
- ここでも**パスワードは画面に表示されません**
- 数分かかることがあります

**出力例：**
```
[sudo] password for taro:    ← パスワードを入力（表示されない）
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
...
Reading package lists... Done
Building dependency tree... Done
...
XX upgraded, X newly installed, X to remove and X not upgraded.
```

---

### ステップ7: ファイルシステムを理解する（重要）

WSLでは、WindowsとLinuxの2つのファイルシステムが存在します。

```
┌─────────────────────────────────────────────┐
│  Windows側                                   │
│  C:\Users\あなた\Desktop\...                │
│                                             │
│  ↕ WSLからは /mnt/c/ でアクセスできる       │
│                                             │
│  WSL（Ubuntu）側                             │
│  /home/taro/...                             │
│  /mnt/c/  ← WindowsのCドライブ             │
│  /mnt/d/  ← WindowsのDドライブ（あれば）    │
└─────────────────────────────────────────────┘
```

**よく使うパスの対応表：**

| Windows側のパス | WSL側のパス |
|----------------|------------|
| `C:\` | `/mnt/c/` |
| `C:\Users\taro\Desktop` | `/mnt/c/Users/taro/Desktop` |
| `C:\work` | `/mnt/c/work` |
| `D:\` | `/mnt/d/` |

> **作業フォルダのおすすめ**: `C:\work` を作って、WSLからは `/mnt/c/work` で作業すると分かりやすいです。

---

## 5. VS Codeをインストールする

VS Code（Visual Studio Code）は、プログラミング用のテキストエディタです。

### 手順

1. **VS Codeをダウンロード**
   - ブラウザで以下のURLを開く：
   - **https://code.visualstudio.com/**

2. **「Download for Windows」をクリック**
   - 青いボタンをクリック
   - ダウンロードが始まります

3. **インストーラーを実行**
   - ダウンロードした `VSCodeUserSetup-x64-X.XX.X.exe` をダブルクリック
   - 「使用許諾契約書に同意する」にチェック
   - 「次へ」をクリックしていく

4. **オプション設定（推奨）**

   以下にチェックを入れることをお勧めします：
   - ✅ デスクトップ上にアイコンを作成する
   - ✅ エクスプローラーのファイルコンテキストメニューに「Codeで開く」アクションを追加する
   - ✅ エクスプローラーのディレクトリコンテキストメニューに「Codeで開く」アクションを追加する
   - ✅ PATHへの追加

5. **「インストール」をクリック**

6. **完了**

---

## 6. VS CodeにWSL拡張機能を追加する

VS CodeからWSL環境を使うために、拡張機能をインストールします。

### 手順

1. **VS Codeを起動**

2. **拡張機能を開く**
   - 左サイドバーの「四角が4つ」のアイコンをクリック
   - または `Ctrl + Shift + X` を押す

   ```
   ┌──────┬─────────────────────────┐
   │  📁  │                         │
   │  🔍  │                         │
   │  🔀  │                         │
   │  🐛  │                         │
   │  ⬜⬜ │ ← これをクリック        │
   │  ⬜⬜ │                         │
   └──────┴─────────────────────────┘
   ```

3. **「WSL」で検索**
   - 検索ボックスに「WSL」と入力

4. **「WSL」をインストール**
   - 「WSL」（Microsoft製、青いアイコン）を探す
   - 「インストール」ボタンをクリック

5. **インストール完了**
   - ボタンが「アンインストール」に変わればOK

---

## 7. Node.jsをインストールする

Claude Codeを動かすためにNode.jsが必要です。nvm（Node Version Manager）を使ってインストールします。

### 手順

1. **Ubuntuを開く**
   - スタートメニューで「Ubuntu」を検索して開く
   - または、VS Codeのターミナルから実行

2. **nvmをインストール**

   以下のコマンドをコピーして貼り付け、Enterキーを押します：

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
   ```

3. **設定を反映**

   ```bash
   source ~/.bashrc
   ```

4. **Node.jsをインストール**

   ```bash
   nvm install 22
   ```

5. **インストール確認**

   ```bash
   node --version
   ```

   `v22.x.x` のように表示されればOK！

   ```bash
   npm --version
   ```

   バージョン番号が表示されればOK！

---

## 8. Claude Codeをインストールする

いよいよClaude Codeをインストールします。

### 手順

1. **Ubuntuを開く**（開いていない場合）

2. **Claude Codeをインストール**

   以下のコマンドを実行します：

   ```bash
   claude install
   ```

3. **インストール完了メッセージを確認**

   以下のようなメッセージが表示されます：

   ```
   ✔ Claude Code successfully installed!

     Version: 2.1.31

     Location: ~/.local/bin/claude

     Next: Run claude --help to get started

   ⚠ Setup notes:
     • Native installation exists but ~/.local/bin is not in your PATH. Run:

     echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
   ```

4. **PATHを設定する（重要！）**

   上記のメッセージに書かれているコマンドを実行します：

   ```bash
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
   ```

   > **解説**: このコマンドは「claudeコマンドを使えるようにする設定」を追加しています

5. **インストール確認**

   ```bash
   claude --version
   ```

   バージョン番号が表示されればOK！

---

## 9. 動作確認

すべてのインストールが完了したら、実際に動作確認をしましょう。

### チェックリスト

| 確認項目 | コマンド | 期待する結果 |
|---------|---------|-------------|
| WSL | `wsl --version` | バージョン情報が表示される |
| Node.js | `node --version` | `v22.x.x` と表示される |
| npm | `npm --version` | バージョン番号が表示される |
| Claude Code | `claude --version` | バージョン番号が表示される |

### Claude Codeを起動してみる

1. **作業フォルダに移動**

   ```bash
   cd /mnt/c/
   ```

2. **Claude Codeを起動**

   ```bash
   claude
   ```

3. **初回認証**
   - ブラウザが自動的に開きます
   - Anthropicアカウントでログイン
   - 認証完了後、ターミナルに戻ります

4. **終了する場合**
   - `/exit` と入力してEnter
   - または `Ctrl + C`

---

## 10. トラブルシューティング

### WSLインストール編

#### Q: 「wsl --install」でエラーが出る

**エラー例1**: 「管理者として実行してください」
**解決策**: PowerShellを「管理者として実行」してから、もう一度コマンドを実行

**エラー例2**: `0x80370102` — 仮想化が無効
**解決策**: [3. BIOS設定](#3-bios設定仮想化を有効にする) を参照して仮想化を有効にする

**エラー例3**: `0x80004005` や `0x8007019e` — Windows機能が未有効
**解決策**: PowerShell（管理者）で以下を実行してから再起動：

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

再起動後にもう一度 `wsl --install` を実行。

---

#### Q: 仮想化を有効にしてもWSLがインストールできない

**確認項目**:
1. Windowsのバージョンが古くないか（Windows 10 バージョン2004以降が必要）
2. Windows Updateを最新にする

**Windowsバージョン確認方法**:
1. `Win + R` を押す
2. `winver` と入力してEnter
3. バージョン情報を確認

---

### Ubuntu初期セットアップ編

#### Q: 再起動後にUbuntuが開かない

**解決策**:
1. スタートメニューで「Ubuntu」を検索して開く
2. 見つからない場合は、Microsoft Storeで「Ubuntu」を検索してインストール
3. それでもダメな場合、PowerShell（管理者）で：
   ```powershell
   wsl --install -d Ubuntu
   ```

---

#### Q: 「WslRegisterDistribution failed」エラー

**エラー例**:
```
WslRegisterDistribution failed with error: 0x80370102
```

**原因**: 仮想化機能が有効になっていない

**解決策**:
1. [3. BIOS設定](#3-bios設定仮想化を有効にする) で仮想化を有効にする
2. さらに、PowerShell（管理者）で以下を実行：
   ```powershell
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```
3. パソコンを再起動
4. スタートメニューから「Ubuntu」を再度開く

---

#### Q: ユーザー名設定で「invalid username」と言われる

**エラー例**:
```
adduser: Please enter a username matching the regular expression configured
```

**原因**: ユーザー名に使えない文字が含まれている

**解決策**: 以下のルールでユーザー名を入力し直す
- **半角英小文字**で始める（大文字NG）
- 使えるのは: 英小文字、数字、ハイフン(-)、アンダースコア(_)
- スペース、日本語は使えない
- 例: `taro`、`yamada`、`t-yamada`

---

#### Q: パスワードを何度入れても「Sorry, passwords do not match」になる

**原因**: 1回目と2回目のパスワード入力が一致していない

**解決策**:
1. 落ち着いてゆっくり入力する（画面に何も表示されないが入力されている）
2. どうしてもうまくいかない場合：
   - まずメモ帳（Notepad）にパスワードを打つ
   - それを選択してコピー（Ctrl+C）
   - Ubuntuの画面で**右クリック**して貼り付け（Ctrl+Vではなく右クリック）
   - 2回目も同じように貼り付ける

---

#### Q: Ubuntuが途中でフリーズした / 応答しない

**解決策**:

1. **Ubuntuのウィンドウを閉じる**
2. **PowerShellで強制終了**：
   ```powershell
   wsl --shutdown
   ```
3. **スタートメニューから「Ubuntu」を再度開く**

それでもダメな場合、Ubuntuを一度アンインストールして再インストール：
```powershell
wsl --unregister Ubuntu
wsl --install -d Ubuntu
```

> **⚠ 注意**: `--unregister` するとUbuntu内のデータがすべて消えます。
> 初回セットアップ中なら問題ありません。

---

#### Q: sudoのパスワードが通らない

**原因**: Ubuntuセットアップ時に設定したパスワードと違うものを入力している

**解決策**:

パスワードを忘れた場合、PowerShellからリセットできます：

```powershell
wsl -u root
```

rootユーザーで入ったら：

```bash
passwd ユーザー名
```

例: `passwd taro` → 新しいパスワードを2回入力 → `exit` で抜ける

---

### VS Code・接続編

#### Q: VS CodeでWSLに接続できない

**解決策**:
1. VS Codeを再起動
2. 左下の緑色の「><」アイコンをクリック
3. 「Connect to WSL」を選択

それでもダメな場合：
- VS CodeのWSL拡張機能が入っているか確認（拡張機能タブで「WSL」検索）
- WSL自体が起動しているか確認（PowerShellで `wsl -l -v` を実行）

---

#### Q: VS Codeのターミナルがbashではなく PowerShellになる

**原因**: WSLに接続せずにフォルダを開いている

**解決策**:
1. VS Codeの左下に `WSL: Ubuntu` と表示されているか確認
2. 表示されていなければ、左下の「><」アイコン → 「Reopen Folder in WSL」

---

### Claude Code・Node.js編

#### Q: 「claude install」でエラーが出る

**エラー例**: `command not found: claude`

**解決策**:
npmでインストールする従来の方法を試します：

```bash
npm install -g @anthropic-ai/claude-code
```

---

#### Q: 「claude」コマンドが見つからない

**エラー例**: `command not found: claude`

**解決策**:
PATH設定を確認・再実行します：

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

それでも動かない場合：

```bash
~/.local/bin/claude --version
```

これでバージョンが表示されれば、PATHの問題です。

---

#### Q: Node.jsのバージョンが古い

**解決策**:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

---

### 最終手段: WSLをリセットする

何をやってもうまくいかない場合、WSLを完全にリセットして最初からやり直せます。

```powershell
wsl --unregister Ubuntu
wsl --install -d Ubuntu
```

> **⚠ これを実行するとUbuntu内のすべてのデータが消えます。**
> Node.jsやClaude Codeも再インストールが必要です。
> Windows側（Cドライブ）のファイルには影響しません。

---

## インストール完了後の次のステップ

環境構築が完了したら、以下のマニュアルを参照してください：

- [Claude Code 使い方マニュアル](./claude-code-setup.md)
- [HP制作でのClaude Code活用](../hp/99-claude-code.md)

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-05 | 初版作成（claude installコマンド対応） |
| 2026-03-10 | WSL/Ubuntuセットアップ手順を大幅拡充、トラブルシューティング追加 |
