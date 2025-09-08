import * as assert from 'assert';
import * as vscode from 'vscode';

suite('扩展测试套件', () => {
  vscode.window.showInformationMessage('开始执行测试');

  test('扩展是否已激活', async () => {
    // 检查扩展是否已成功激活
    const extension = vscode.extensions.getExtension('universal-dev-platform');
    assert.ok(extension);

    if (!extension?.isActive) {
      await extension?.activate();
    }

    assert.ok(extension?.isActive);
  });

  test('命令是否已注册', () => {
    // 检查命令是否已注册
    return vscode.commands.getCommands(true)
      .then(commands => {
        // 检查我们的命令是否存在
        const ourCommands = commands.filter(command =>
          command.startsWith('universal-dev-platform.')
        );
        assert.ok(ourCommands.length >= 3); // 至少有3个命令
      });
  });
});
