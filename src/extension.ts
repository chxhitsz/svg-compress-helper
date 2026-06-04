import * as vscode from 'vscode';
import {
  compressSvgCommand,
  compressToMonoCommand,
} from './commands/compressCommands';

export function activate(context: vscode.ExtensionContext) {
  // 注册压缩命令
  const compressCmd = vscode.commands.registerCommand(
    'svg-compress-helper.compressSvg',
    (uri: vscode.Uri, uris: vscode.Uri[]) => {
      compressSvgCommand(uri, uris, context.extensionUri);
    }
  );

  // 注册单色转换命令
  const compressMonoCmd = vscode.commands.registerCommand(
    'svg-compress-helper.compressToMono',
    (uri: vscode.Uri, uris: vscode.Uri[]) => {
      compressToMonoCommand(uri, uris, context.extensionUri);
    }
  );

  context.subscriptions.push(compressCmd, compressMonoCmd);
}

export function deactivate() {}
