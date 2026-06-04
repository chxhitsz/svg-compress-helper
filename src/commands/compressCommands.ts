import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  compressSvg,
  getSvgoConfig,
  calculateCompression,
  isSvgFile,
  formatBytes,
  ProcessedFile,
  CompressionResult,
} from '../utils/svgoConfig';
import { SvgPreviewPanel } from '../utils/svgPreview';

export interface ProcessedFileWithContent extends ProcessedFile {
  originalContent?: string;
  optimizedContent?: string;
}

async function processFiles(
  files: vscode.Uri[],
  monochrome: boolean,
  progress: vscode.Progress<{ message?: string; increment?: number }>,
  token: vscode.CancellationToken
): Promise<ProcessedFileWithContent[]> {
  const results: ProcessedFileWithContent[] = [];
  const config = await getSvgoConfig();

  for (let i = 0; i < files.length; i++) {
    if (token.isCancellationRequested) {
      break;
    }

    const fileUri = files[i];
    const filePath = fileUri.fsPath;

    progress.report({
      message: `Processing ${path.basename(filePath)} (${i + 1}/${files.length})`,
      increment: (100 / files.length),
    });

    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const optimized = await compressSvg(content, config, monochrome);
      await fs.promises.writeFile(filePath, optimized, 'utf-8');

      const result = calculateCompression(content, optimized);
      results.push({
        filePath,
        success: true,
        result,
        originalContent: content,
        optimizedContent: optimized,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.push({ filePath, success: false, error: errorMsg });
    }
  }

  return results;
}

function showResults(
  results: ProcessedFileWithContent[],
  monochrome: boolean,
  extensionUri: vscode.Uri
) {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length === 0) {
    vscode.window.showErrorMessage(
      'SVG compression failed. No files were processed successfully.'
    );
    return;
  }

  // 如果只处理了一个文件，显示预览面板
  if (successful.length === 1) {
    const file = successful[0];
    if (file.result && file.originalContent && file.optimizedContent) {
      SvgPreviewPanel.createOrShow(
        extensionUri,
        path.basename(file.filePath),
        file.originalContent,
        file.optimizedContent,
        {
          originalSize: file.result.originalSize,
          optimizedSize: file.result.optimizedSize,
          savings: file.result.savings,
          savingsPercent: file.result.savingsPercent,
        }
      );
    }
  }

  // 计算总体压缩情况
  let totalOriginal = 0;
  let totalOptimized = 0;

  successful.forEach((r) => {
    if (r.result) {
      totalOriginal += r.result.originalSize;
      totalOptimized += r.result.optimizedSize;
    }
  });

  const totalSavings = totalOriginal - totalOptimized;
  const totalPercent = ((totalSavings / totalOriginal) * 100).toFixed(2);

  // 构建详细消息
  const messageLines = [
    `**SVG Compression Complete (${monochrome ? 'Monochrome' : 'Standard'})**`,
    '',
    `**Files processed:** ${successful.length}${failed.length > 0 ? ` (${failed.length} failed)` : ''}`,
    `**Total saved:** ${formatBytes(totalSavings)} (${totalPercent}%)`,
    `**Before:** ${formatBytes(totalOriginal)}`,
    `**After:** ${formatBytes(totalOptimized)}`,
    '',
    '**File Details:**',
  ];

  successful.forEach((r) => {
    if (r.result) {
      const fileName = path.basename(r.filePath);
      messageLines.push(
        `- ${fileName}: ${r.result.savingsPercent}% saved (${formatBytes(r.result.originalSize)} → ${formatBytes(r.result.optimizedSize)})`
      );
    }
  });

  if (failed.length > 0) {
    messageLines.push('', '**Failed Files:**');
    failed.forEach((r) => {
      messageLines.push(`- ${path.basename(r.filePath)}: ${r.error}`);
    });
  }

  // 创建输出面板显示详细结果
  const outputChannel = vscode.window.createOutputChannel('SVG Compress Helper');
  outputChannel.clear();
  outputChannel.appendLine(messageLines.join('\n'));
  outputChannel.show(true);

  // 显示简要消息
  const message = successful.length === 1
    ? `Compressed ${path.basename(successful[0].filePath)}. Saved ${formatBytes(totalSavings)} (${totalPercent}%). Preview opened.`
    : `Compressed ${successful.length} SVG file(s). Saved ${formatBytes(totalSavings)} (${totalPercent}%). Click to view details.`;

  vscode.window.showInformationMessage(
    message,
    successful.length > 1 ? 'View Details' : ''
  ).then((selection) => {
    if (selection === 'View Details') {
      outputChannel.show();
    }
  });
}

export async function compressSvgCommand(uri: vscode.Uri, uris: vscode.Uri[], extensionUri: vscode.Uri) {
  // 处理多选情况
  const files = uris && uris.length > 0 ? uris : [uri];
  const svgFiles = files.filter((f) => isSvgFile(f.fsPath));

  if (svgFiles.length === 0) {
    vscode.window.showWarningMessage('No SVG files selected.');
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Compressing SVG files...',
      cancellable: true,
    },
    async (progress, token) => {
      const results = await processFiles(svgFiles, false, progress, token);
      showResults(results, false, extensionUri);
    }
  );
}

export async function compressToMonoCommand(uri: vscode.Uri, uris: vscode.Uri[], extensionUri: vscode.Uri) {
  // 处理多选情况
  const files = uris && uris.length > 0 ? uris : [uri];
  const svgFiles = files.filter((f) => isSvgFile(f.fsPath));

  if (svgFiles.length === 0) {
    vscode.window.showWarningMessage('No SVG files selected.');
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Converting SVG files to monochrome...',
      cancellable: true,
    },
    async (progress, token) => {
      const results = await processFiles(svgFiles, true, progress, token);
      showResults(results, true, extensionUri);
    }
  );
}
