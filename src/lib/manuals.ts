import fs from "fs";
import path from "path";

const manualsDirectory = path.join(process.cwd(), "docs", "manuals");
const flowsDirectory = path.join(process.cwd(), "docs", "flows");
const guidelinesDirectory = path.join(process.cwd(), "docs", "guidelines");

export interface ManualData {
  content: string;
  fileName: string;
}

/**
 * Markdownファイル内の <!-- include: path/to/file.md --> を処理して
 * 参照先ファイルの内容を埋め込む
 *
 * 構文: <!-- include: common/pre-meeting-flow.md -->
 * パスは docs/manuals/ からの相対パス
 *
 * @param content Markdownコンテンツ
 * @param maxDepth 最大ネスト深度（無限ループ防止）
 * @param currentDepth 現在の深度
 */
function processIncludes(
  content: string,
  maxDepth: number = 5,
  currentDepth: number = 0
): string {
  if (currentDepth >= maxDepth) {
    console.warn("Include depth limit reached");
    return content;
  }

  // <!-- include: path/to/file.md --> パターンを検索
  const includePattern = /<!--\s*include:\s*([^\s]+)\s*-->/g;

  return content.replace(includePattern, (match, includePath) => {
    const filePath = path.join(manualsDirectory, includePath.trim());

    if (!fs.existsSync(filePath)) {
      console.warn(`Include file not found: ${filePath}`);
      return `<!-- include error: file not found: ${includePath} -->`;
    }

    try {
      const includedContent = fs.readFileSync(filePath, "utf-8");
      // 再帰的にincludeを処理
      return processIncludes(includedContent, maxDepth, currentDepth + 1);
    } catch (error) {
      console.error(`Error reading include file: ${filePath}`, error);
      return `<!-- include error: ${includePath} -->`;
    }
  });
}

/**
 * 指定された商材・ファイル名のマニュアルmdファイルを読み込む
 * ファイル名形式: {fileName}.md (例: 00-overall-manual.md)
 *
 * <!-- include: path/to/file.md --> 構文をサポート
 */
export function getManual(
  productId: string,
  fileName: string
): ManualData | null {
  const productDir = path.join(manualsDirectory, productId);

  if (!fs.existsSync(productDir)) {
    return null;
  }

  const targetFile = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
  const filePath = path.join(productDir, targetFile);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const content = processIncludes(rawContent);

  return {
    content,
    fileName: targetFile,
  };
}

/**
 * 指定された商材・タスク番号のマニュアルmdファイルを読み込む
 * ファイル名形式: {taskNo}-{name}.md (例: 00-受注・ワークス立ち上げ.md)
 *
 * <!-- include: path/to/file.md --> 構文をサポート
 */
export function getManualByTaskNo(
  productId: string,
  taskNo: string
): ManualData | null {
  const productDir = path.join(manualsDirectory, productId);

  // ディレクトリが存在するか確認
  if (!fs.existsSync(productDir)) {
    return null;
  }

  // タスク番号にマッチするmdファイルを検索
  const files = fs.readdirSync(productDir);
  const paddedTaskNo = taskNo.padStart(2, "0");
  const targetFile = files.find(
    (file) => file.startsWith(`${paddedTaskNo}-`) && file.endsWith(".md")
  );

  if (!targetFile) {
    return null;
  }

  // mdファイルを読み込み
  const filePath = path.join(productDir, targetFile);
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const content = processIncludes(rawContent);

  return {
    content,
    fileName: targetFile,
  };
}

/**
 * 指定された商材の全マニュアルファイル一覧を取得
 */
export function getAllManualsByProduct(productId: string): string[] {
  const productDir = path.join(manualsDirectory, productId);

  if (!fs.existsSync(productDir)) {
    return [];
  }

  return fs
    .readdirSync(productDir)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

/**
 * 共通マニュアルを読み込む
 * ファイル配置: docs/manuals/common/{name}.md
 *
 * <!-- include: path/to/file.md --> 構文をサポート
 */
export function getCommonManual(name: string): ManualData | null {
  const commonDir = path.join(manualsDirectory, "common");

  if (!fs.existsSync(commonDir)) {
    return null;
  }

  const fileName = name.endsWith(".md") ? name : `${name}.md`;
  const filePath = path.join(commonDir, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const content = processIncludes(rawContent);

  return {
    content,
    fileName,
  };
}

/**
 * 共通マニュアルの全ファイル一覧を取得
 */
export function getAllCommonManuals(): string[] {
  const commonDir = path.join(manualsDirectory, "common");

  if (!fs.existsSync(commonDir)) {
    return [];
  }

  return fs
    .readdirSync(commonDir)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

/**
 * フローmdファイルを読み込む
 * ファイル配置: docs/flows/{productId}/{flowName}.md
 */
export function getFlow(
  productId: string,
  flowName: string
): ManualData | null {
  const productDir = path.join(flowsDirectory, productId);

  if (!fs.existsSync(productDir)) {
    return null;
  }

  const fileName = flowName.endsWith(".md") ? flowName : `${flowName}.md`;
  const filePath = path.join(productDir, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf-8");

  return {
    content,
    fileName,
  };
}

/**
 * ガイドラインmdファイルを読み込む
 * ファイル配置: docs/guidelines/{productId}/{guidelineName}.md
 */
export function getGuideline(
  productId: string,
  guidelineName: string
): ManualData | null {
  const productDir = path.join(guidelinesDirectory, productId);

  if (!fs.existsSync(productDir)) {
    return null;
  }

  const fileName = guidelineName.endsWith(".md")
    ? guidelineName
    : `${guidelineName}.md`;
  const filePath = path.join(productDir, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf-8");

  return {
    content,
    fileName,
  };
}
