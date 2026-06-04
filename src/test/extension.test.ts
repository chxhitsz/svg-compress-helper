import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('svg-compress-helper.svg-compress-helper'));
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('svg-compress-helper.compressSvg'));
    assert.ok(commands.includes('svg-compress-helper.compressToMono'));
  });
});
