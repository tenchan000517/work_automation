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
 * 指定された商材・タスク番号のマニュアルmdファイルを読み込む
 * ファイル名形式: {taskNo}-{name}.md (例: 00-受注・ワークス立ち上げ.md)
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
  const content = fs.readFileSync(filePath, "utf-8");

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

  const content = fs.readFileSync(filePath, "utf-8");

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
