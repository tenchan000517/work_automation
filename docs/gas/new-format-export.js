/**
 * 求人原稿ヒアリングシート出力スクリプト（新フォーマット版）
 * 列構造：[0]セクション [1]ラベル [2]値1 [3]サブラベル [4]値2 [5]サブラベル2
 */

function getSheetDataNew() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  const result = {
    出力日時: new Date().toLocaleString('ja-JP'),
    シート名: sheet.getName(),
    Part1_基本情報: {},
    Part2_ヒアリング情報: {}
  };

  let currentPart = "";
  let currentSection = "";

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const col0 = clean(row[0]);
    const col1 = clean(row[1]);
    const col2 = clean(row[2]);
    const col3 = clean(row[3]);
    const col4 = clean(row[4]);
    const col5 = clean(row[5]);

    // パート検出
    if (col0.includes("Part①") || col0.includes("Part1")) {
      currentPart = "Part1";
      continue;
    }
    if (col0.includes("Part②") || col0.includes("Part2")) {
      currentPart = "Part2";
      continue;
    }

    // セクション検出（▼マーク）
    if (col0.startsWith("▼")) {
      currentSection = col0.replace("▼", "").trim();
      if (currentPart === "Part1") {
        result.Part1_基本情報[currentSection] = {};
      } else if (currentPart === "Part2") {
        result.Part2_ヒアリング情報[currentSection] = {};
      }
      continue;
    }

    // 説明行・ヘッダー行スキップ
    if (col0.includes("🟨") || col0.includes("🟦") || col0.includes("【参考") ||
        col0.includes("原稿ヒアリングシート") || col0.includes("★★★")) {
      continue;
    }

    if (col1 === "No" && col2 === "氏名") {
      continue;
    }

    if (!col0 && !col1) continue;

    if (currentPart === "Part1" && currentSection) {
      parsePart1New(result.Part1_基本情報[currentSection], col1, col2, col3, col4, col5);
    }

    if (currentPart === "Part2" && currentSection) {
      parsePart2New(result.Part2_ヒアリング情報, currentSection, col0, col1, col2, col3, col4, col5);
    }
  }

  cleanupEmptyValues(result);
  return result;
}

function parsePart1New(target, col1, col2, col3, col4, col5) {
  if (!col1 || !target) return;

  // 勤務時間・休憩時間
  if (col1.includes("勤務時間") || col1.includes("休憩時間")) {
    if (col2 || col4) {
      target[col1] = {
        "開始": col2,
        "終了": col4
      };
    }
    return;
  }

  // 残業時間
  if (col1 === "残業時間") {
    target["残業時間"] = {
      "日": col2,
      "月": col4
    };
    return;
  }

  // 休日日数
  if (col1 === "休日日数") {
    target["休日日数"] = {
      "月平均": col2,
      "年間": col4
    };
    return;
  }

  // みなし/固定残業代
  if (col1.includes("みなし") || col1.includes("固定残業")) {
    target["みなし_固定残業代"] = {
      "時間": col2,
      "金額": col4
    };
    return;
  }

  // 社会保険
  if (col1 === "雇用保険") {
    if (!target["社会保険"]) target["社会保険"] = {};
    target["社会保険"]["雇用保険"] = col2;
    target["社会保険"]["労災保険"] = col4;
    return;
  }
  if (col1 === "厚生年金") {
    if (!target["社会保険"]) target["社会保険"] = {};
    target["社会保険"]["厚生年金"] = col2;
    target["社会保険"]["健康保険"] = col4;
    return;
  }

  // 製品①②③
  if (col1.startsWith("製品")) {
    target[col1] = {
      "内容": col2,
      "重さ_サイズ": col4
    };
    return;
  }

  // 平均年齢・男女比
  if (col1.includes("平均年齢") || col1.includes("男女比")) {
    target["平均年齢"] = col2;
    target["男女比"] = col4;
    return;
  }

  // 試用期間
  if (col1 === "試用期間") {
    target["試用期間"] = {
      "有無": col2,
      "期間": col4
    };
    return;
  }

  // 転勤
  if (col1 === "転勤") {
    target["転勤"] = col2;
    if (col4) target["転勤先"] = col4;
    return;
  }

  // 残業
  if (col1 === "残業") {
    target["残業"] = col2;
    if (col4) target["開始時間"] = col4;
    return;
  }

  // 長期休暇
  if (col1 === "長期休暇") {
    target["長期休暇"] = col2;
    if (col4) target["長期休暇詳細"] = col4;
    return;
  }

  // 賞与
  if (col1 === "賞与") {
    target["賞与"] = col2;
    if (col4) target["賞与月数"] = col4;
    return;
  }

  // 通常のフィールド
  if (col2) {
    target[col1] = col2;
  }
}

function parsePart2New(target, section, col0, col1, col2, col3, col4, col5) {
  const sectionTarget = target[section];
  if (!sectionTarget) return;

  // 社員の声
  if (section.includes("社員の声")) {
    if (!target["社員の声"]) target["社員の声"] = [];
    if (col1 === "①" || col1 === "②" || col1 === "③" || col1 === "④") {
      if (col2 || col5) {
        target["社員の声"].push({
          "No": col1,
          "氏名": col2,
          "部署": col3,
          "年数": col4,
          "インタビュー内容": col5
        });
      }
    }
    return;
  }

  // 求人写真
  if (section.includes("求人写真")) {
    if (col1.startsWith("写真")) {
      const checked = [col2, col3, col4, col5].filter(v => v && v.includes("☑")).join(", ");
      if (checked) sectionTarget[col1] = checked;
    } else if (col1.includes("その他") || col1.includes("アピール")) {
      if (col2) sectionTarget["その他アピール"] = col2;
    }
    return;
  }

  // ペルソナ設定
  if (col1 === "ペルソナ設定") {
    sectionTarget["ペルソナ設定"] = {
      "性別": col2,
      "年齢": col4,
      "外国人": col5 || ""
    };
    return;
  }

  // 通常のフィールド
  if (col1 && col2) {
    sectionTarget[col1] = col2;
  }
}

function clean(val) {
  if (val === null || val === undefined) return "";
  let str = String(val).trim();
  if (str === "～" || str === "h" || str === "円" || str === "歳" ||
      str === "日" || str === "年目" || str === "さん" || str === "ヶ月" ||
      str === "実働" || str === "詳細" || str === "月平均" || str === "年間") {
    return "";
  }
  return str;
}

function cleanupEmptyValues(obj) {
  for (const key in obj) {
    const val = obj[key];
    if (val === null || val === undefined || val === "") {
      delete obj[key];
    } else if (Array.isArray(val)) {
      if (val.length === 0) delete obj[key];
    } else if (typeof val === "object") {
      cleanupEmptyValues(val);
      if (Object.keys(val).length === 0) delete obj[key];
    }
  }
}

function downloadAsJsonNew() {
  const data = getSheetDataNew();
  const json = JSON.stringify(data, null, 2);
  const companyName = data.Part1_基本情報?.企業概要?.企業名 || "未設定";
  const fileName = "ヒアリングシート_" + companyName + "_" + formatDate(new Date()) + ".json";
  showDownloadDialog(json, fileName, 'JSON');
}

function downloadAsTextNew() {
  const data = getSheetDataNew();
  const text = convertToText(data);
  const companyName = data.Part1_基本情報?.企業概要?.企業名 || "未設定";
  const fileName = "ヒアリングシート_" + companyName + "_" + formatDate(new Date()) + ".txt";
  showDownloadDialog(text, fileName, 'テキスト');
}

function showDownloadDialog(content, fileName, formatName) {
  const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const html = HtmlService.createHtmlOutput(
    '<html><head><style>' +
    'body{font-family:sans-serif;padding:20px}' +
    'button{padding:12px 24px;margin:5px;border:none;border-radius:6px;cursor:pointer}' +
    '.primary{background:#4285f4;color:#fff}' +
    '.secondary{background:#f1f3f4;color:#333}' +
    'textarea{width:100%;height:320px;margin-top:15px;font-family:monospace;font-size:12px}' +
    '.msg{color:#0d904f;margin-top:10px;display:none}' +
    '</style></head><body>' +
    '<h3>📄 ' + formatName + 'データ出力完了</h3>' +
    '<button class="primary" onclick="dl()">💾 ダウンロード</button>' +
    '<button class="secondary" onclick="cp()">📋 コピー</button>' +
    '<div class="msg" id="msg">✓ コピーしました</div>' +
    '<textarea id="c" readonly>' + escaped + '</textarea>' +
    '<script>' +
    'const c=' + JSON.stringify(content) + ',f=' + JSON.stringify(fileName) + ';' +
    'function dl(){const b=new Blob([c],{type:"text/plain;charset=utf-8"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=f;a.click()}' +
    'function cp(){navigator.clipboard.writeText(c).then(()=>{document.getElementById("msg").style.display="block";setTimeout(()=>{document.getElementById("msg").style.display="none"},2000)})}' +
    '</script></body></html>'
  ).setWidth(650).setHeight(520);
  SpreadsheetApp.getUi().showModalDialog(html, 'AI用データ出力');
}

function convertToText(data, indent) {
  indent = indent || 0;
  let text = "";
  const pre = "  ".repeat(indent);
  for (const key in data) {
    const val = data[key];
    if (val === null || val === undefined || val === "") continue;
    if (Array.isArray(val)) {
      text += pre + "【" + key + "】\n";
      val.forEach(function(item, i) {
        if (typeof item === "object") {
          text += pre + "  [" + (i + 1) + "]\n" + convertToText(item, indent + 2);
        } else {
          text += pre + "  • " + item + "\n";
        }
      });
    } else if (typeof val === "object") {
      text += pre + "【" + key + "】\n" + convertToText(val, indent + 1);
    } else {
      text += pre + key + ": " + val + "\n";
    }
  }
  return text;
}

function formatDate(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
}

function debugSheetDataFull() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  let output = "=== シート構造確認 ===\n\nシート名: " + sheet.getName() + "\n行数: " + data.length + "\n列数: " + (data[0] ? data[0].length : 0) + "\n\n";
  for (let i = 0; i < Math.min(30, data.length); i++) {
    output += "--- 行" + (i + 1) + " ---\n";
    for (let j = 0; j < Math.min(6, data[i].length); j++) {
      const c = String(data[i][j] || "").trim();
      if (c) output += "  [" + j + "] " + c.substring(0, 50) + "\n";
    }
    output += "\n";
  }
  const html = HtmlService.createHtmlOutput('<textarea style="width:100%;height:400px">' + output.replace(/</g, '&lt;') + '</textarea>').setWidth(700).setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, 'デバッグ');
}
