# サンプル工業株式会社 テスト用文字起こし

## 企業情報

| 項目 | 内容 |
|------|------|
| 企業名 | サンプル工業株式会社 |
| 業種 | 金属加工業（プレス・板金） |
| 目的 | 新卒採用PV |
| ターゲット | 高卒・専門学校卒 |
| トンマナ | 温かみ・挑戦的 |

---

## ヒアリング文字起こし

以下のテキストを「文字起こしを整理」機能に貼り付けてテストしてください。

```
うちはサンプル工業といって、金属のプレス加工と板金加工をやっている会社です。創業30年になります。

場所は愛知県の安城市で、社員は45名くらいですね。自動車部品が多いです。あとは建設機械の部品とか。

今回PVを作りたいのは、高卒の子に来てほしいからです。最近は大学進学が多くて、工業高校からの応募が減ってるんですよね。でも実際、うちで活躍してるのは高卒の子が多いんです。

求める人材としては、まずは体力があること。あとは素直さですかね。技術は入ってから教えますから。先輩について3年くらいで一人前になれます。

職場の雰囲気は、まあ製造業なのでガチャガチャはしてますけど（笑）、人間関係は良いですよ。先輩後輩の仲もいいし、休憩時間は冗談言い合ったり。

安全面では、安全靴と保護メガネは必須です。プレス機を使うので、安全手袋もですね。作業着は支給してます。

絶対NGなのは、危険そうに見える映像ですね。プレス機って確かにパワーがあるんですけど、安全装置もしっかりしてるし、ルールを守れば安全なんです。あと、暗い印象になるのも避けたいです。

伝えたいメッセージとしては、「ものづくりの楽しさ」ですかね。自分が加工した部品が車になって走ってるって、すごいことだと思うんです。あと、手に職がつくこと。溶接とかプレスとか、一生使える技術が身につく。

音声は、ナレーションは若めの男性がいいですね。元気な感じで。BGMは、あんまり暗くなくて、前向きな感じのがいいです。

歌詞付きの曲は、うーん、あってもなくてもいいですけど、もし入れるなら「一歩ずつ進む」みたいな、努力を応援する感じがいいかな。

あ、あと、うちの自慢は社長が現場に出てくることですね。毎朝朝礼で一緒に体操するし、困ったことがあったら直接相談できる。そういう風通しの良さも伝えたいです。
```

---

## 期待されるAI出力（抽出データ）

```json
{
  "worldView": {
    "industryType": "金属加工業（プレス・板金）",
    "companyScale": "社員45名、愛知県安城市",
    "targetWorkplace": "プレス加工場、板金加工場",
    "specialFeatures": [
      "自動車部品・建設機械部品を製造",
      "創業30年の実績",
      "高卒社員が活躍"
    ]
  },
  "desiredPersonality": {
    "idealTraits": [
      "体力がある",
      "素直さ",
      "学ぶ意欲"
    ],
    "workStyle": "先輩について技術を学ぶ（3年で一人前）",
    "growthOpportunity": "溶接・プレスなど一生使える技術が身につく"
  },
  "workplaceAtmosphere": {
    "general": "活気があり、人間関係が良好",
    "communication": "先輩後輩の仲が良い、休憩時間は和気あいあい",
    "management": "社長が現場に出て、風通しが良い"
  },
  "safetyEquipment": {
    "required": [
      "安全靴",
      "保護メガネ",
      "安全手袋",
      "作業着（支給）"
    ],
    "reason": "プレス機作業の安全確保"
  },
  "ngElements": {
    "expressions": [
      "危険そうに見える映像",
      "暗い印象"
    ],
    "notes": [
      "安全装置があり、ルールを守れば安全であることを伝える"
    ]
  },
  "keyMessages": [
    "ものづくりの楽しさ",
    "自分が加工した部品が車になって走る",
    "手に職がつく（一生使える技術）",
    "風通しの良さ（社長との距離が近い）"
  ],
  "audioPreferences": {
    "narration": {
      "gender": "男性（若め）",
      "style": "元気な感じ"
    },
    "bgm": {
      "style": "前向き、明るい",
      "mood": "暗くない曲調"
    },
    "lyrics": {
      "theme": "一歩ずつ進む、努力を応援",
      "style": "あってもなくても可"
    }
  }
}
```

---

## テスト用台本JSON（12シーン+エンディング）

```json
{
  "characters": [
    {
      "name": "山田健太",
      "gender": "男性",
      "currentAge": "22歳",
      "pastAge": "18歳",
      "hair": "short black hair, slightly spiky",
      "eyes": "bright brown eyes, energetic",
      "build": "athletic build, strong arms",
      "pastOutfit": "high school uniform, industrial course",
      "currentOutfit": "navy blue work uniform, safety glasses, safety shoes, work gloves"
    }
  ],
  "scenes": [
    {
      "name": "工場の朝",
      "phase": "現在",
      "location": "工場入口",
      "characters": "山田健太",
      "action": "朝日を浴びながら工場に入っていく",
      "mood": "希望、活気",
      "narration": "毎日がものづくりの始まり。",
      "videoPrompt": "Young Japanese man in work uniform walking into factory entrance, morning sunlight, hopeful atmosphere"
    },
    {
      "name": "高校時代の迷い",
      "phase": "過去",
      "location": "高校の教室",
      "characters": "山田健太（18歳）",
      "action": "窓の外を見つめながら進路に悩む",
      "mood": "不安、迷い",
      "narration": "大学に行かない選択は、不安だった。",
      "videoPrompt": "18 year old Japanese high school boy in classroom, looking out window, worried expression, afternoon light"
    },
    {
      "name": "工場見学",
      "phase": "過去",
      "location": "プレス加工場",
      "characters": "山田健太（18歳）",
      "action": "初めてプレス機を見て目を輝かせる",
      "mood": "驚き、興味",
      "narration": null,
      "videoPrompt": "18 year old boy in factory tour, looking at large press machine with amazed expression, industrial setting"
    },
    {
      "name": "入社初日",
      "phase": "過去",
      "location": "会社玄関",
      "characters": "山田健太",
      "action": "緊張した面持ちで会社の前に立つ",
      "mood": "緊張、決意",
      "narration": "ここで、自分の道を切り開く。",
      "videoPrompt": "Young man in new work uniform standing in front of factory building, nervous but determined, spring morning"
    },
    {
      "name": "先輩の指導",
      "phase": "過去",
      "location": "加工場",
      "characters": "山田健太、先輩社員",
      "action": "先輩が丁寧に機械の操作を教える",
      "mood": "真剣、温かい",
      "narration": null,
      "videoPrompt": "Senior worker teaching young worker how to operate machine, patient guidance, warm atmosphere"
    },
    {
      "name": "失敗と悔しさ",
      "phase": "過去",
      "location": "加工場",
      "characters": "山田健太",
      "action": "加工ミスをして落ち込む",
      "mood": "挫折、悔しさ",
      "narration": "何度も失敗した。でも、諦めなかった。",
      "videoPrompt": "Young worker looking disappointed at defective metal part, dim lighting, frustrated expression"
    },
    {
      "name": "技術の習得",
      "phase": "転換点",
      "location": "加工場",
      "characters": "山田健太",
      "action": "集中して精密な加工を成功させる",
      "mood": "集中、達成",
      "narration": null,
      "videoPrompt": "Worker focused on operating press machine, precise movements, sparks flying, successful completion"
    },
    {
      "name": "チームワーク",
      "phase": "現在",
      "location": "休憩室",
      "characters": "山田健太、同僚たち",
      "action": "休憩時間に仲間と笑い合う",
      "mood": "和気あいあい、絆",
      "narration": "仲間がいるから、頑張れる。",
      "videoPrompt": "Young workers laughing together in break room, friendly atmosphere, team bonding"
    },
    {
      "name": "後輩への指導",
      "phase": "現在",
      "location": "加工場",
      "characters": "山田健太、後輩",
      "action": "今度は自分が後輩に教える立場に",
      "mood": "成長、責任感",
      "narration": null,
      "videoPrompt": "Worker teaching younger colleague, role reversal from earlier, confident posture"
    },
    {
      "name": "完成品を見つめる",
      "phase": "現在",
      "location": "検査場",
      "characters": "山田健太",
      "action": "自分が作った部品を誇らしげに見つめる",
      "mood": "誇り、充実",
      "narration": "この部品が、誰かの車になる。",
      "videoPrompt": "Worker holding finished metal part, examining it with pride, sunlight reflecting off surface"
    },
    {
      "name": "社長との朝礼",
      "phase": "現在",
      "location": "工場前",
      "characters": "山田健太、社員たち、社長",
      "action": "社長と一緒にラジオ体操",
      "mood": "一体感、風通しの良さ",
      "narration": null,
      "videoPrompt": "Morning assembly with company president and workers doing exercises together, sunny morning"
    },
    {
      "name": "明日への一歩",
      "phase": "未来",
      "location": "工場前",
      "characters": "山田健太",
      "action": "夕日を背景に、前を向いて立つ",
      "mood": "希望、決意",
      "narration": "手に職を、この手に。明日も、ものづくりは続く。",
      "videoPrompt": "Young worker standing confidently in front of factory, sunset background, hopeful future"
    }
  ],
  "ending": {
    "type": "object_to_logo",
    "sourceObject": "金属部品が回転しながら集まりロゴを形成",
    "animationType": null,
    "finalText": "サンプル工業株式会社\n〜 ものづくりで、未来をつくる 〜",
    "videoPrompt": "Metal parts spinning and assembling to form company logo, metallic shine, professional ending"
  }
}
```

---

## クイックテスト手順

1. **新規シート作成**: 「サンプル工業株式会社」でシート作成
2. **文字起こし整理**: 上記の文字起こしテキストを貼り付け
3. **台本生成**: ストーリーパターン「自分を見つける」、スタイル「新海誠風」を選択
4. **台本パース**: 上記の台本JSONを貼り付け
