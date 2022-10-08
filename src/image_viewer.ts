import path = require('path');
import * as vscode from 'vscode';


function getWebviewOptions(extensionUri: vscode.Uri) {
    return {
        // Enable javascript in the webview
        enableScripts: true,
    };
}


export class ImageViewer {

    public static currentPanel: ImageViewer | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _imageList: string[];

    constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._disposables = [];
        this._imageList = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        }, null, this._disposables);
    }

    static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        if (ImageViewer.currentPanel) {
            ImageViewer.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel('Image Comparator', 'Image Comparator', column || vscode.ViewColumn.One, getWebviewOptions(extensionUri));
        ImageViewer.currentPanel = new ImageViewer(panel, extensionUri);
        panel.iconPath = vscode.Uri.joinPath(extensionUri, 'icon.png');
    }

    static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        ImageViewer.currentPanel = new ImageViewer(panel, extensionUri);
    }

    doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    dispose() {
        ImageViewer.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    _update() {
        const webview = this._panel.webview;
        this._panel.title = "Image Comparator";
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    _getHtmlForWebview(webview: vscode.Webview) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'viewer.js');
        
        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        // Local path to css styles
        const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
        const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
        const stylesViewerPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'viewer.css');

        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(styleResetPath);
        const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
        const stylesViewerUri = webview.asWebviewUri(stylesViewerPath);
        
        // Create Image Box Object
        const imageBoxObj = [
            {
                "elements" : new Array<any>,
                "title" : "Image Comparator",
                "frame_number" : 0,
            }
        ];
        
        // Populate with user selected images
        this._imageList.forEach( (image) => {
            imageBoxObj[0]["elements"].push({
                    "version": "-",
                    "title": path.parse(image).base,
                    "image": webview.asWebviewUri(vscode.Uri.file(image)).toString(),
            });
        });

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src * ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
                
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<link href="${stylesViewerUri}" rel="stylesheet">
			</head>
			<body>
            <div class="container content  scene-content" id="content">
				<script nonce="${nonce}" src="${scriptUri}"></script>
                <script nonce="${nonce}">
                    var imageBoxes = ${JSON.stringify(imageBoxObj)};
                    let content = document.getElementById("content");
                    new ImageBox(content, imageBoxes);
                </script>
            </body>
            </html>`;
    }

    addImage(image_file: string) {
        this._imageList.push(image_file);
        this._update();
    }

    static registerImage(image_file: string){
        if (ImageViewer.currentPanel) {
            ImageViewer.currentPanel.addImage(image_file);
        }
    }
}


function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
