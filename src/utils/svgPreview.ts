import * as vscode from 'vscode';

export class SvgPreviewPanel {
  public static currentPanel: SvgPreviewPanel | undefined;
  public static readonly viewType = 'svgCompressPreview';

  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    fileName: string,
    originalSvg: string,
    optimizedSvg: string,
    compressionStats: {
      originalSize: number;
      optimizedSize: number;
      savings: number;
      savingsPercent: string;
    }
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // 如果已经有一个面板，则更新它
    if (SvgPreviewPanel.currentPanel) {
      SvgPreviewPanel.currentPanel._panel.reveal(column);
      SvgPreviewPanel.currentPanel._update(
        fileName,
        originalSvg,
        optimizedSvg,
        compressionStats
      );
      return;
    }

    // 创建新的面板
    const panel = vscode.window.createWebviewPanel(
      SvgPreviewPanel.viewType,
      `SVG Preview: ${fileName}`,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    SvgPreviewPanel.currentPanel = new SvgPreviewPanel(
      panel,
      extensionUri,
      fileName,
      originalSvg,
      optimizedSvg,
      compressionStats
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    fileName: string,
    originalSvg: string,
    optimizedSvg: string,
    compressionStats: {
      originalSize: number;
      optimizedSize: number;
      savings: number;
      savingsPercent: string;
    }
  ) {
    this._panel = panel;

    // 当面板关闭时清理
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // 更新内容
    this._update(fileName, originalSvg, optimizedSvg, compressionStats);
  }

  private _update(
    fileName: string,
    originalSvg: string,
    optimizedSvg: string,
    compressionStats: {
      originalSize: number;
      optimizedSize: number;
      savings: number;
      savingsPercent: string;
    }
  ) {
    const webview = this._panel.webview;
    this._panel.title = `SVG Preview: ${fileName}`;

    // 转义SVG内容以嵌入HTML
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    // 格式化字节大小
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    this._panel.webview.html = this._getHtmlForWebview(
      webview,
      fileName,
      originalSvg,
      optimizedSvg,
      compressionStats,
      formatBytes
    );
  }

  private _getHtmlForWebview(
    webview: vscode.Webview,
    fileName: string,
    originalSvg: string,
    optimizedSvg: string,
    stats: {
      originalSize: number;
      optimizedSize: number;
      savings: number;
      savingsPercent: string;
    },
    formatBytes: (bytes: number) => string
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SVG Compression Preview</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 20px;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
    
    .header {
      margin-bottom: 20px;
    }
    
    .file-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: var(--vscode-titleBar-activeForeground);
    }
    
    .stats {
      display: flex;
      gap: 20px;
      padding: 15px;
      background-color: var(--vscode-inputValidation-infoBackground);
      border-left: 4px solid var(--vscode-inputValidation-infoBorder);
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    
    .stat-label {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 16px;
      font-weight: bold;
      color: var(--vscode-foreground);
    }
    
    .savings {
      color: #4CAF50;
    }
    
    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    
    .preview-box {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      overflow: hidden;
    }
    
    .preview-header {
      padding: 10px 15px;
      background-color: var(--vscode-editorGroupHeader-tabsBackground);
      border-bottom: 1px solid var(--vscode-panel-border);
      font-weight: bold;
    }
    
    .preview-content {
      padding: 20px;
      background-color: var(--vscode-editor-background);
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .svg-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    svg {
      max-width: 100%;
      max-height: 350px;
    }
    
    .toggle-container {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .toggle-btn {
      padding: 8px 16px;
      border: 1px solid var(--vscode-button-border);
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      cursor: pointer;
      border-radius: 4px;
    }
    
    .toggle-btn:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }
    
    .toggle-btn.active {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="file-name">${fileName}</div>
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Original Size</span>
        <span class="stat-value">${formatBytes(stats.originalSize)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Optimized Size</span>
        <span class="stat-value">${formatBytes(stats.optimizedSize)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Saved</span>
        <span class="stat-value savings">${formatBytes(stats.savings)} (${stats.savingsPercent}%)</span>
      </div>
    </div>
  </div>
  
  <div class="container">
    <div class="preview-box">
      <div class="preview-header">Original SVG</div>
      <div class="preview-content">
        <div class="svg-container">
          ${originalSvg}
        </div>
      </div>
    </div>
    
    <div class="preview-box">
      <div class="preview-header">Optimized SVG</div>
      <div class="preview-content">
        <div class="svg-container">
          ${optimizedSvg}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  public dispose() {
    SvgPreviewPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
