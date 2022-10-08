import * as vscode from 'vscode';
import { ImageViewer } from './image_viewer.js';


export function activate(context: vscode.ExtensionContext) {
		
	context.subscriptions.push(vscode.commands.registerCommand('image-comparator.openViewer', function () {
		// Open Comparator Window
		ImageViewer.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('image-comparator.addImage', function (uri: vscode.Uri) {
		// Add Image to Comparator
		ImageViewer.registerImage(uri.fsPath);
	}));
}
