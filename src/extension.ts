// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path from 'path';
import * as vscode from 'vscode';
const fs = require('fs');

class MyTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly children: MyTreeItem[] = [],
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.command = command;
	}
}
  
export class MyTreeDataProvider implements vscode.TreeDataProvider<MyTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<MyTreeItem | undefined | void> = new vscode.EventEmitter<MyTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<MyTreeItem | undefined | void> = this._onDidChangeTreeData.event;
  
	getTreeItem(element: MyTreeItem): vscode.TreeItem {
	  return element;
	}
  
	getChildren(element?: MyTreeItem): Thenable<MyTreeItem[]> {
	  if (!element) {
		// 根节点
		return Promise.resolve(this.getData());
	  }
	  // 子节点
	  return Promise.resolve(element.children);
	}
  
	private getData(): MyTreeItem[] {
	  return [
		new MyTreeItem('cosv3部署汇总检查', vscode.TreeItemCollapsibleState.None, [], {
			command: 'healthcheck.checkall',
			title: 'checkall',
			arguments: ['https://stg.mercury.rendering.360.autodesk.com/health']
		  }),
		new MyTreeItem('cosv3部署分支检查', vscode.TreeItemCollapsibleState.Collapsed, [
			new MyTreeItem('stg', vscode.TreeItemCollapsibleState.None),
			new MyTreeItem('stg-emea', vscode.TreeItemCollapsibleState.None),
			new MyTreeItem('prd', vscode.TreeItemCollapsibleState.None),
			new MyTreeItem('prd-emea', vscode.TreeItemCollapsibleState.None)
		]),
		new MyTreeItem('apitest执行结果', vscode.TreeItemCollapsibleState.None),
		new MyTreeItem('jmeter执行结果', vscode.TreeItemCollapsibleState.None),
		new MyTreeItem('aws 告警', vscode.TreeItemCollapsibleState.None),
		new MyTreeItem('raas监控', vscode.TreeItemCollapsibleState.None),
	  ];
	}
  
	refresh(): void {
	  this._onDidChangeTreeData.fire();
	}
}

function showUrlInWebview(context: vscode.ExtensionContext, url: string) {
    const panel = vscode.window.createWebviewPanel(
        'urlViewer',
        'URL Viewer',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    // 图标路径
    const iconUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, 'media', 'admin_2875381.png')));
	const styleUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, 'media', 'style.css')));
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, 'media', 'script.js')));
	const iconPath = vscode.Uri.file(
        path.join(__dirname, 'media', 'admin_2875381.png')
    );
    panel.iconPath = iconPath;
    const htmlPath = path.join(__dirname, 'static', 'webview.html');

    // 读取 HTML 文件内容
    let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // 替换占位符
    htmlContent = htmlContent
        .replace(/{{iconUri}}/g, iconUri.toString())
        .replace(/{{iconPath}}/g, path.join(__dirname, 'media', 'admin_2875381.png'))
		.replace(/{{styleUri}}/g, styleUri.toString())
        .replace(/{{scriptUri}}/g, scriptUri.toString())
        .replace(/{{url}}/g, url);

    // 设置 Webview 的 HTML 内容
    panel.webview.html = htmlContent;

	panel.webview.onDidReceiveMessage(
		(message) => {
			switch (message.command) {
				case 'alert':
					vscode.window.showInformationMessage(message.text);
					break;
			}
		},
		undefined,
		context.subscriptions
	);
}

export function activate(context: vscode.ExtensionContext) {
	console.log('插件已激活');

	const treeDataProvider = new MyTreeDataProvider();
	vscode.window.registerTreeDataProvider('health conponent', treeDataProvider);

	const disposable = vscode.commands.registerCommand('启动healthcheck', () => {
		vscode.window.showInformationMessage('healthcheck启动');
	});

	context.subscriptions.push(disposable);

    const checkall = vscode.commands.registerCommand('healthcheck.checkall', (url: string) => {
		showUrlInWebview(context, url);
	})
}

export function deactivate() {}
