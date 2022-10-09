import * as vscode from 'vscode';
import { ImageViewer } from './image_viewer.js';


export function activate(context: vscode.ExtensionContext) {
		
	context.subscriptions.push(vscode.commands.registerCommand('image-comparator.openViewer', function () {
		// Open Comparator Window
		ImageViewer.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('image-comparator.addImage', function (uri: vscode.Uri) {
		if (uri != undefined) {
			// Add Image from context menu to Comparator
			ImageViewer.registerImage(uri.fsPath);
		}
		else {
			// Search Dialog to Add x1 Image to Comparator
			const options: vscode.OpenDialogOptions = {
				canSelectMany: false,
				openLabel: 'Open',
				filters: {
					'Images': ['png', 'jpg', 'jpeg'],
				}
			};
			vscode.window.showOpenDialog(options).then(fileUri => {
				if (fileUri && fileUri[0]) {
					// Add Image to Comparator
					ImageViewer.registerImage(fileUri[0].fsPath);
				}
			});
		}
	}));
}
