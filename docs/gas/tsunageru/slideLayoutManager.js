/**
 * Google スライド レイアウト統一スクリプト
 *
 * 概要:
 * 1ページ目を基準として、2〜20ページ目の要素の位置・サイズを統一する
 *
 * 対象:
 * - SHEETS_CHART（スプレッドシートリンクのグラフ）
 * - TABLE（テーブル）
 * - IMAGE（画像）
 * - SHAPE（シェイプ）
 *
 * 実行順序:
 * 1. alignToFirstSlide - 位置を統一
 * 2. alignTableSizesAdvanced - テーブルの行高さ・列幅を統一
 *
 * 事前準備:
 * - サービス → Slides API を追加
 *
 * 注意:
 * - テーブル内のテキスト、リンク、書式は変更されない
 * - スプレッドシートリンクは維持される
 *
 * @version 1.0.0
 * @created 2026-02-16
 */

// ========================================
// 設定
// ========================================

var CONFIG = {
  START_PAGE: 2,    // 開始ページ（1始まり）
  END_PAGE: 20,     // 終了ページ（1始まり）
  TARGET_TYPES: ['SHEETS_CHART', 'TABLE', 'IMAGE', 'SHAPE']
};

// ========================================
// 構造分析（確認用）
// ========================================

/**
 * 1ページ目の全要素の構造を分析・出力
 * 実行後、ログ（Ctrl+Enter）で確認
 */
function analyzeFirstSlide() {
  var presentation = SlidesApp.getActivePresentation();
  var firstSlide = presentation.getSlides()[0];
  var elements = firstSlide.getPageElements();

  console.log('=== 1ページ目の要素構造 ===');
  console.log('要素数: ' + elements.length);

  elements.forEach(function(el, i) {
    var type = el.getPageElementType().toString();
    console.log('');
    console.log('--- 要素 ' + i + ' [' + type + '] ---');

    var left = el.getLeft();
    var top = el.getTop();
    var width = el.getWidth();
    var height = el.getHeight();

    console.log('位置: X=' + (left != null ? left.toFixed(1) : 'N/A') + ', Y=' + (top != null ? top.toFixed(1) : 'N/A'));
    console.log('サイズ: W=' + (width != null ? width.toFixed(1) : 'N/A') + ', H=' + (height != null ? height.toFixed(1) : 'N/A'));

    if (type === 'TABLE') {
      try {
        var table = el.asTable();
        console.log('テーブル: ' + table.getNumRows() + '行 x ' + table.getNumColumns() + '列');
      } catch(e) {
        console.log('テーブル詳細取得エラー: ' + e.message);
      }
    }
    if (type === 'SHEETS_CHART') {
      console.log('スプレッドシートリンクあり');
    }
  });
}

/**
 * 全ページの要素タイプ別サマリーを出力
 */
function analyzeAllSlides() {
  var presentation = SlidesApp.getActivePresentation();
  var slides = presentation.getSlides();

  console.log('=== 全ページ要素サマリー ===');
  console.log('総ページ数: ' + slides.length);

  slides.forEach(function(slide, i) {
    var elements = slide.getPageElements();
    var types = {};

    elements.forEach(function(el) {
      var type = el.getPageElementType().toString();
      types[type] = (types[type] || 0) + 1;
    });

    var summary = Object.keys(types).map(function(t) {
      return t + ':' + types[t];
    }).join(', ');

    console.log('P' + (i+1) + ': ' + (summary || '(empty)'));
  });
}

// ========================================
// Step 1: 位置統一
// ========================================

/**
 * 1ページ目を基準に2〜20ページ目の要素位置を統一
 * Y座標でソートしてマッチングするため、要素の並び順が異なっていても正しく対応
 */
function alignToFirstSlide() {
  var presentation = SlidesApp.getActivePresentation();
  var slides = presentation.getSlides();
  var firstSlide = slides[0];

  // 1ページ目の基準レイアウトをタイプ別・Y座標ソートで取得
  var refByType = {};
  CONFIG.TARGET_TYPES.forEach(function(t) { refByType[t] = []; });

  firstSlide.getPageElements().forEach(function(el) {
    var type = el.getPageElementType().toString();
    if (refByType[type] !== undefined) {
      refByType[type].push({
        left: el.getLeft(),
        top: el.getTop(),
        width: el.getWidth(),
        height: el.getHeight()
      });
    }
  });

  // 各タイプをY座標でソート（上から順に）
  CONFIG.TARGET_TYPES.forEach(function(t) {
    refByType[t].sort(function(a, b) {
      return a.top - b.top;
    });
  });

  console.log('基準レイアウト（Y座標順）:');
  CONFIG.TARGET_TYPES.forEach(function(t) {
    if (refByType[t].length > 0) {
      var info = refByType[t].map(function(r) {
        return 'Y=' + r.top.toFixed(0);
      }).join(', ');
      console.log('  ' + t + ': ' + refByType[t].length + '個 [' + info + ']');
    }
  });

  var updated = 0;
  var skipped = 0;
  var endIdx = Math.min(CONFIG.END_PAGE, slides.length);

  for (var i = CONFIG.START_PAGE - 1; i < endIdx; i++) {
    // 各ページの要素をタイプ別に収集
    var elementsByType = {};
    CONFIG.TARGET_TYPES.forEach(function(t) { elementsByType[t] = []; });

    slides[i].getPageElements().forEach(function(el) {
      var type = el.getPageElementType().toString();
      if (elementsByType[type] !== undefined) {
        elementsByType[type].push({
          element: el,
          top: el.getTop() || 0
        });
      }
    });

    // 各タイプをY座標でソート
    CONFIG.TARGET_TYPES.forEach(function(t) {
      elementsByType[t].sort(function(a, b) {
        return a.top - b.top;
      });
    });

    // マッチングして適用
    CONFIG.TARGET_TYPES.forEach(function(t) {
      var refs = refByType[t];
      var elems = elementsByType[t];

      for (var j = 0; j < Math.min(refs.length, elems.length); j++) {
        var ref = refs[j];
        var el = elems[j].element;

        try {
          // 位置を設定
          el.setLeft(ref.left);
          el.setTop(ref.top);

          // サイズが取得できる要素のみサイズも設定
          if (ref.width != null && ref.height != null) {
            el.setWidth(ref.width);
            el.setHeight(ref.height);
          }

          updated++;
        } catch(e) {
          console.log('P' + (i+1) + ' ' + t + '[' + j + '] error: ' + e.message);
          skipped++;
        }
      }
    });
  }

  console.log('===== 完了 =====');
  console.log('更新: ' + updated);
  console.log('スキップ: ' + skipped);
  console.log('対象: P' + CONFIG.START_PAGE + ' - P' + endIdx);
}

// ========================================
// Step 2: テーブル行高さ・列幅統一（Slides API使用）
// ========================================

/**
 * 1ページ目を基準にテーブルの行高さ・列幅を統一
 * Advanced Slides Service（Slides API）を使用
 *
 * 事前準備: サービス → Slides API を追加
 */
function alignTableSizesAdvanced() {
  var presentation = SlidesApp.getActivePresentation();
  var presentationId = presentation.getId();
  var slides = presentation.getSlides();

  // 1ページ目のテーブル情報を取得
  var refTables = [];
  slides[0].getPageElements().forEach(function(el) {
    if (el.getPageElementType().toString() === 'TABLE') {
      refTables.push({
        objectId: el.getObjectId(),
        top: el.getTop()
      });
    }
  });
  refTables.sort(function(a, b) { return a.top - b.top; });

  // Advanced APIで詳細情報を取得
  var presData = Slides.Presentations.get(presentationId);
  var page0 = presData.slides[0];

  // 1ページ目のテーブルサイズ情報を取得
  var refLayouts = [];
  refTables.forEach(function(ref, idx) {
    var tableData = null;
    page0.pageElements.forEach(function(pe) {
      if (pe.objectId === ref.objectId && pe.table) {
        tableData = pe.table;
      }
    });

    if (tableData) {
      var rowHeights = tableData.tableRows.map(function(row) {
        return row.rowHeight ? row.rowHeight.magnitude : 0;
      });
      var colWidths = tableData.tableColumns.map(function(col) {
        return col.columnWidth ? col.columnWidth.magnitude : 0;
      });

      console.log('基準テーブル' + idx + ':');
      console.log('  行数: ' + tableData.rows + ', 列数: ' + tableData.columns);

      refLayouts.push({
        rowHeights: rowHeights,
        colWidths: colWidths,
        numRows: tableData.rows,
        numCols: tableData.columns
      });
    }
  });

  // 2〜20ページのテーブルに適用
  var requests = [];
  var endIdx = Math.min(CONFIG.END_PAGE, slides.length);

  for (var i = CONFIG.START_PAGE - 1; i < endIdx; i++) {
    var pageTables = [];
    slides[i].getPageElements().forEach(function(el) {
      if (el.getPageElementType().toString() === 'TABLE') {
        pageTables.push({
          objectId: el.getObjectId(),
          top: el.getTop()
        });
      }
    });
    pageTables.sort(function(a, b) { return a.top - b.top; });

    for (var j = 0; j < Math.min(refLayouts.length, pageTables.length); j++) {
      var ref = refLayouts[j];
      var targetId = pageTables[j].objectId;

      // 行高さを設定
      for (var r = 0; r < ref.numRows; r++) {
        requests.push({
          updateTableRowProperties: {
            objectId: targetId,
            rowIndices: [r],
            tableRowProperties: {
              minRowHeight: {
                magnitude: ref.rowHeights[r],
                unit: 'EMU'
              }
            },
            fields: 'minRowHeight'
          }
        });
      }

      // 列幅を設定
      for (var c = 0; c < ref.numCols; c++) {
        requests.push({
          updateTableColumnProperties: {
            objectId: targetId,
            columnIndices: [c],
            tableColumnProperties: {
              columnWidth: {
                magnitude: ref.colWidths[c],
                unit: 'EMU'
              }
            },
            fields: 'columnWidth'
          }
        });
      }
    }
  }

  console.log('リクエスト数: ' + requests.length);

  if (requests.length > 0) {
    Slides.Presentations.batchUpdate({ requests: requests }, presentationId);
    console.log('===== 完了 =====');
  } else {
    console.log('更新対象なし');
  }
}

// ========================================
// ユーティリティ
// ========================================

/**
 * 1ページ目と指定ページの要素を比較（デバッグ用）
 * @param {number} pageNum - 比較するページ番号（1始まり）
 */
function compareWithFirstSlide(pageNum) {
  pageNum = pageNum || 2;

  var presentation = SlidesApp.getActivePresentation();
  var slides = presentation.getSlides();

  console.log('=== 1ページ目 ===');
  slides[0].getPageElements().forEach(function(el, i) {
    var type = el.getPageElementType().toString();
    var left = el.getLeft() || 0;
    var top = el.getTop() || 0;
    console.log(i + ': ' + type + ' (' + left.toFixed(1) + ', ' + top.toFixed(1) + ')');
  });

  console.log('');
  console.log('=== ' + pageNum + 'ページ目 ===');
  slides[pageNum - 1].getPageElements().forEach(function(el, i) {
    var type = el.getPageElementType().toString();
    var left = el.getLeft() || 0;
    var top = el.getTop() || 0;
    console.log(i + ': ' + type + ' (' + left.toFixed(1) + ', ' + top.toFixed(1) + ')');
  });
}

/**
 * サイズ不一致の要素を検出
 */
function findSizeMismatch() {
  var presentation = SlidesApp.getActivePresentation();
  var slides = presentation.getSlides();
  var TARGET_TYPES = ['SHEETS_CHART', 'IMAGE', 'SHAPE'];

  // 1ページ目の基準サイズ（Y座標順）
  var refByType = {};
  TARGET_TYPES.forEach(function(t) { refByType[t] = []; });

  slides[0].getPageElements().forEach(function(el) {
    var type = el.getPageElementType().toString();
    if (refByType[type] !== undefined) {
      var w = el.getWidth();
      var h = el.getHeight();
      if (w != null && h != null) {
        refByType[type].push({ width: w, height: h, top: el.getTop() });
      }
    }
  });

  TARGET_TYPES.forEach(function(t) {
    refByType[t].sort(function(a, b) { return a.top - b.top; });
  });

  console.log('=== サイズ不一致を検出 ===');
  var mismatchCount = 0;

  for (var i = 1; i < slides.length; i++) {
    var elementsByType = {};
    TARGET_TYPES.forEach(function(t) { elementsByType[t] = []; });

    slides[i].getPageElements().forEach(function(el) {
      var type = el.getPageElementType().toString();
      if (elementsByType[type] !== undefined) {
        var w = el.getWidth();
        var h = el.getHeight();
        if (w != null && h != null) {
          elementsByType[type].push({ width: w, height: h, top: el.getTop() });
        }
      }
    });

    TARGET_TYPES.forEach(function(t) {
      elementsByType[t].sort(function(a, b) { return a.top - b.top; });

      for (var j = 0; j < Math.min(refByType[t].length, elementsByType[t].length); j++) {
        var ref = refByType[t][j];
        var elem = elementsByType[t][j];
        var wDiff = Math.abs(ref.width - elem.width);
        var hDiff = Math.abs(ref.height - elem.height);

        if (wDiff > 0.5 || hDiff > 0.5) {
          console.log('P' + (i+1) + ' ' + t + '[' + j + ']: ' +
            elem.width.toFixed(1) + 'x' + elem.height.toFixed(1) +
            ' (基準: ' + ref.width.toFixed(1) + 'x' + ref.height.toFixed(1) + ')');
          mismatchCount++;
        }
      }
    });
  }

  if (mismatchCount === 0) {
    console.log('サイズ不一致なし');
  } else {
    console.log('合計: ' + mismatchCount + '件の不一致');
  }
}
