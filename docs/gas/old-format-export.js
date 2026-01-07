/**
 * 求人原稿ヒアリングシート出力スクリプト（旧フォーマット版）
 * 列0-9のみをデータとして取得（列10以降はメモ）
 */

// データ取得の列数制限
const MAX_DATA_COL = 10;

function getSheetData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  const result = {
    出力日時: new Date().toLocaleString('ja-JP'),
    シート名: sheet.getName(),
    Part1_基本情報: {},
    Part2_詳細情報: {}
  };

  let currentPart = "";
  let currentSection = "";

  for (let i = 0; i < data.length; i++) {
    const row = data[i].slice(0, MAX_DATA_COL);
    const col0 = clean(row[0]);
    const col1 = clean(row[1]);
    const col2 = clean(row[2]);
    const col3 = clean(row[3]);
    const col4 = clean(row[4]);
    const col5 = clean(row[5]);
    const col6 = clean(row[6]);
    const col7 = clean(row[7]);
    const col8 = clean(row[8]);
    const col9 = clean(row[9]);

    // パート検出
    if (col0.toLowerCase().includes("part①") || col0.toLowerCase().includes("part1")) {
      currentPart = "Part1";
      continue;
    }
    if (col0.toLowerCase().includes("part②") || col0.toLowerCase().includes("part2")) {
      currentPart = "Part2";
      continue;
    }

    // 空行スキップ
    if (!col0 && !col1) continue;

    // Part1の処理
    if (currentPart === "Part1") {

      // 企業概要セクション
      if (col0 === "企業概要") {
        currentSection = "企業概要";
        result.Part1_基本情報[currentSection] = {};
        if (col1 === "企業名" && col2) {
          result.Part1_基本情報[currentSection]["企業名"] = col2;
        }
        if (col4 === "設立日" && col5) {
          result.Part1_基本情報[currentSection]["設立日"] = col5;
        }
        if (col7 === "担当者" && col8) {
          result.Part1_基本情報[currentSection]["担当者"] = col8;
        }
        continue;
      }

      // 企業概要のサブ項目
      if (currentSection === "企業概要" && !col0 && col1) {
        if (col1 === "代表者") {
          if (col2) result.Part1_基本情報[currentSection]["代表者"] = col2;
          if (col4 === "HP") {
            result.Part1_基本情報[currentSection]["HP"] = col6 || col5 || "";
          }
        } else if (col1 === "住所") {
          result.Part1_基本情報[currentSection]["住所"] = col2;
        } else if (col1 === "転勤") {
          result.Part1_基本情報[currentSection]["転勤"] = col2;
          if (col3) result.Part1_基本情報[currentSection]["転勤先"] = col3;
        } else if (col1 === "連絡先") {
          if (col2) result.Part1_基本情報[currentSection]["連絡先"] = col2;
        } else if (col1 === "事業内容") {
          if (col2) result.Part1_基本情報[currentSection]["事業内容"] = col2;
        } else if (col1.includes("許可番号")) {
          if (col2) result.Part1_基本情報[currentSection]["許可番号"] = col2;
        }
        continue;
      }

      // 求人区分・雇用形態
      if (col0 === "求人区分・雇用形態") {
        currentSection = "求人区分_雇用形態";
        result.Part1_基本情報[currentSection] = {
          "雇用形態": col1
        };
        continue;
      }

      if (currentSection === "求人区分_雇用形態" && !col0 && col1) {
        if (col1 === "試用期間") {
          result.Part1_基本情報[currentSection]["試用期間"] = {
            "有無": col2,
            "期間": col3,
            "条件": col7 || col5 || ""
          };
        } else if (col1 === "職種") {
          result.Part1_基本情報[currentSection]["職種"] = col2;
        }
        continue;
      }

      // 勤務時間
      if (col0 === "勤務時間") {
        currentSection = "勤務時間";
        result.Part1_基本情報[currentSection] = {};
        if (col1 === "①") {
          addTimeData(result.Part1_基本情報[currentSection], "①", col2, col5, col8);
        }
        continue;
      }

      if (currentSection === "勤務時間" && !col0 && (col1 === "②" || col1 === "③" || col1 === "備考")) {
        if (col1 === "備考") {
          if (col2) result.Part1_基本情報[currentSection]["備考"] = col2;
        } else {
          addTimeData(result.Part1_基本情報[currentSection], col1, col2, col5, col8);
        }
        continue;
      }

      // 休憩時間
      if (col0 === "休憩時間") {
        currentSection = "休憩時間";
        result.Part1_基本情報[currentSection] = {};
        if (col1 === "①") {
          addTimeData(result.Part1_基本情報[currentSection], "①", col2, col5, col8);
        }
        continue;
      }

      if (currentSection === "休憩時間" && !col0 && (col1 === "②" || col1 === "③" || col1 === "備考")) {
        if (col1 === "備考") {
          if (col2) result.Part1_基本情報[currentSection]["備考"] = col2;
        } else {
          addTimeData(result.Part1_基本情報[currentSection], col1, col2, col5, col8);
        }
        continue;
      }

      // 残業
      if (col0 === "残業") {
        currentSection = "残業";
        result.Part1_基本情報[currentSection] = {
          "有無": col1
        };
        if (col3) result.Part1_基本情報[currentSection]["開始時間"] = col3;
        if (col5) result.Part1_基本情報[currentSection]["日"] = col5;
        if (col7) result.Part1_基本情報[currentSection]["月"] = col7;
        continue;
      }

      if (col0 === "備考" && currentSection === "残業") {
        if (col1) result.Part1_基本情報[currentSection]["備考"] = col1;
        continue;
      }

      // 休日
      if (col0 === "休日") {
        currentSection = "休日";
        result.Part1_基本情報[currentSection] = {};
        continue;
      }

      if (currentSection === "休日" && !col0 && col1) {
        if (col1.includes("休日区分")) {
          if (col2) result.Part1_基本情報[currentSection]["休日区分"] = col2;
          if (col5) result.Part1_基本情報[currentSection]["月平均休日"] = col5;
          if (col7) result.Part1_基本情報[currentSection]["年間休日"] = col7;
        } else if (col1.includes("カレンダー")) {
          result.Part1_基本情報[currentSection]["会社カレンダー"] = col2;
          if (col5) result.Part1_基本情報[currentSection]["長期休暇"] = col5;
        } else if (col1 === "備考") {
          if (col2) result.Part1_基本情報[currentSection]["備考"] = col2;
        }
        continue;
      }

      // 給与
      if (col0 === "給与") {
        currentSection = "給与";
        result.Part1_基本情報[currentSection] = {
          "給与形態": col1
        };
        if (col6) result.Part1_基本情報[currentSection]["給与額"] = col6;
        continue;
      }

      if (col0 === "想定年収") {
        if (!result.Part1_基本情報["給与"]) result.Part1_基本情報["給与"] = {};
        if (col1) result.Part1_基本情報["給与"]["想定年収"] = col1;
        if (col6 === "賞与" || col5 === "賞与") {
          result.Part1_基本情報["給与"]["賞与"] = {
            "有無": col7 || col6,
            "月数": col8 || col7
          };
        }
        continue;
      }

      if (col0.includes("みなし") || col0.includes("固定残業")) {
        if (!result.Part1_基本情報["給与"]) result.Part1_基本情報["給与"] = {};
        result.Part1_基本情報["給与"]["みなし_固定残業代"] = {
          "時間": col1,
          "金額": col3
        };
        continue;
      }

      // 待遇・福利厚生
      if (col0 === "待遇・福利厚生") {
        currentSection = "待遇_福利厚生";
        result.Part1_基本情報[currentSection] = {
          "社会保険": {
            "雇用保険": col2,
            "労災保険": col4,
            "厚生年金": col6,
            "健康保険": col8
          }
        };
        continue;
      }

      if (col0.includes("その他") && col0.includes("待遇")) {
        if (!result.Part1_基本情報["待遇_福利厚生"]) result.Part1_基本情報["待遇_福利厚生"] = {};
        const otherBenefits = [col1, col2, col3, col4, col5].filter(v => v).join(" / ");
        if (otherBenefits) result.Part1_基本情報["待遇_福利厚生"]["その他"] = otherBenefits;
        continue;
      }

      // 募集背景
      if (col0 === "募集背景") {
        result.Part1_基本情報["募集背景"] = col1 || col2;
        continue;
      }

      // 平均年齢・男女比
      if (col0.includes("平均年齢")) {
        result.Part1_基本情報["会社情報"] = {
          "平均年齢": col1,
          "男女比率": col6 ? `男${col7 || ""}:女${col9 || ""}` : ""
        };
        continue;
      }

      // 募集ターゲット
      if (col0.includes("ターゲット") || col0.includes("ペルソナ")) {
        result.Part1_基本情報["募集ターゲット"] = {
          "性別": col2,
          "年齢": col5,
          "外国人": col7
        };
        continue;
      }

      // 資格・求める人材
      if (col0.includes("資格") || col0.includes("求める人材")) {
        result.Part1_基本情報["資格_求める人材"] = col2 || col1;
        continue;
      }

      // 選考フロー
      if (col0 === "選考フロー") {
        result.Part1_基本情報["選考フロー"] = col2 || col1;
        continue;
      }
    }

    // Part2の処理
    if (currentPart === "Part2") {

      if (col0 === "作業内容") {
        currentSection = "作業内容";
        result.Part2_詳細情報[currentSection] = col1 || "";
        continue;
      }

      if (col0 === "製品・商品・部品") {
        currentSection = "製品_商品_部品";
        result.Part2_詳細情報[currentSection] = {};
        continue;
      }

      if (currentSection === "製品_商品_部品" && (col0 === "①" || col0 === "②" || col0 === "③")) {
        result.Part2_詳細情報[currentSection][col0] = {
          "内容": col1,
          "重さ_サイズ": col5 || ""
        };
        continue;
      }

      if (col0 === "注意点") {
        if (!result.Part2_詳細情報["製品_商品_部品"]) result.Part2_詳細情報["製品_商品_部品"] = {};
        result.Part2_詳細情報["製品_商品_部品"]["注意点"] = col1;
        continue;
      }

      if (col0 === "私たちについて") {
        result.Part2_詳細情報["私たちについて"] = col1;
        continue;
      }

      if (col0 === "社長挨拶") {
        result.Part2_詳細情報["社長挨拶"] = col1;
        continue;
      }

      if (col0 === "会社の魅力") {
        currentSection = "会社の魅力";
        result.Part2_詳細情報[currentSection] = [];
        if (col1) result.Part2_詳細情報[currentSection].push(col1);
        continue;
      }

      if (currentSection === "会社の魅力" && !col0 && col1) {
        result.Part2_詳細情報[currentSection].push(col1);
        continue;
      }

      if (col0 === "雰囲気") {
        currentSection = "雰囲気";
        result.Part2_詳細情報[currentSection] = col1 || "";
        continue;
      }

      if (col0.includes("社員の声")) {
        currentSection = "社員の声";
        result.Part2_詳細情報[currentSection] = [];
        continue;
      }

      if (currentSection === "社員の声" && !col0 && col1 && col1 !== "さん") {
        if (col1.includes("さん") || col2) {
          result.Part2_詳細情報[currentSection].push({
            "氏名": col1,
            "部署": col2,
            "年数": col3
          });
        }
        continue;
      }

      if (col0 === "求人写真") {
        result.Part2_詳細情報["求人写真"] = {
          "写真1": [col1, col2, col3, col4].filter(v => v).join(", ")
        };
        continue;
      }

      if (col0.includes("打ち出していきたい") || col0.includes("最も")) {
        currentSection = "最も打ち出したいポイント";
        result.Part2_詳細情報[currentSection] = col1 || "";
        continue;
      }

      if (col0 === "商談日") {
        result.Part2_詳細情報["管理情報"] = {
          "商談日": col1,
          "受注日": col3,
          "掲載予定日": col5
        };
        continue;
      }
    }
  }

  cleanupEmptyValues(result);
  return result;
}

function clean(val) {
  return String(val || "").trim();
}

function addTimeData(target, key, start, end, hours) {
  if (start || end || hours) {
    target[key] = {};
    if (start) target[key]["開始"] = start;
    if (end) target[key]["終了"] = end;
    if (hours) target[key]["実働"] = hours;
  }
}

function cleanupEmptyValues(obj) {
  for (const key in obj) {
    const val = obj[key];
    if (val === null || val === undefined || val === "" || val === "～" || val === "ｈ" || val === "円") {
      delete obj[key];
    } else if (Array.isArray(val)) {
      if (val.length === 0) delete obj[key];
    } else if (typeof val === "object") {
      cleanupEmptyValues(val);
      if (Object.keys(val).length === 0) delete obj[key];
    }
  }
}

function downloadAsJson() {
  const data = getSheetData();
  const json = JSON.stringify(data, null, 2);
  const companyName = data.Part1_基本情報?.企業概要?.企業名 || "未設定";
  const fileName = "ヒアリングシート_" + companyName + "_" + formatDate(new Date()) + ".json";
  showDownloadDialog(json, fileName, 'JSON');
}

function downloadAsText() {
  const data = getSheetData();
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
    for (let j = 0; j < Math.min(10, data[i].length); j++) {
      const c = String(data[i][j] || "").trim();
      if (c) output += "  [" + j + "] " + c.substring(0, 50) + "\n";
    }
    output += "\n";
  }
  const html = HtmlService.createHtmlOutput('<textarea style="width:100%;height:400px">' + output.replace(/</g, '&lt;') + '</textarea>').setWidth(700).setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, 'デバッグ');
}
