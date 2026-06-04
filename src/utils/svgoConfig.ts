import * as vscode from 'vscode';
import { loadConfig, optimize, Config, PluginConfig } from 'svgo';
import * as path from 'path';
import * as fs from 'fs';

export interface CompressionResult {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: string;
}

export interface ProcessedFile {
  filePath: string;
  success: boolean;
  result?: CompressionResult;
  error?: string;
}

const SVGO_CONFIG_FILES = [
  'svgo.config.js',
  'svgo.config.mjs',
  'svgo.config.cjs',
  '.svgo.yml',
  '.svgorc',
  '.svgorc.js',
];

export async function getSvgoConfig(): Promise<Config | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;

  // 查找配置文件
  for (const configFile of SVGO_CONFIG_FILES) {
    const configPath = path.join(workspaceRoot, configFile);
    if (fs.existsSync(configPath)) {
      try {
        const config = await loadConfig(configPath);
        return config;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showWarningMessage(
          `Failed to load SVGO config from ${configFile}: ${errorMsg}. Using default config.`
        );
        return undefined;
      }
    }
  }

  return undefined;
}

export async function compressSvg(
  svgContent: string,
  config?: Config,
  monochrome: boolean = false
): Promise<string> {
  let finalConfig: Config = config ? { ...config } : {};

  // 如果是单色模式，添加移除颜色的插件
  if (monochrome) {
    finalConfig.plugins = finalConfig.plugins || [];
    
    // 使用SVGO 4.0+的内置插件配置方式
    // 这些插件在BuiltinsWithOptionalParams或BuiltinsWithRequiredParams中定义
    const monoPlugins: PluginConfig[] = [
      'removeStyleElement',
      {
        name: 'removeAttrs',
        params: {
          attrs: [
            'fill',
            'stroke',
            'style',
            'color',
            'stop-color',
            'flood-color',
            'lighting-color',
          ],
        },
      },
      {
        name: 'addAttributesToSVGElement',
        params: {
          attributes: [{ fill: 'currentColor' }],
        },
      },
    ];

    // 将单色插件添加到现有插件列表
    finalConfig.plugins = [...finalConfig.plugins, ...monoPlugins];
  }

  const result = optimize(svgContent, finalConfig);
  return result.data;
}

export function calculateCompression(
  original: string,
  optimized: string
): CompressionResult {
  const originalSize = Buffer.byteLength(original, 'utf-8');
  const optimizedSize = Buffer.byteLength(optimized, 'utf-8');
  const savings = originalSize - optimizedSize;
  const savingsPercent = ((savings / originalSize) * 100).toFixed(2);

  return {
    originalSize,
    optimizedSize,
    savings,
    savingsPercent,
  };
}

export function isSvgFile(filePath: string): boolean {
  return path.extname(filePath).toLowerCase() === '.svg';
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
