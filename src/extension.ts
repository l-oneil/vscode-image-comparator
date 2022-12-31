import * as vscode from 'vscode';
import { ImageViewer } from './image_viewer.js';


export function activate(context: vscode.ExtensionContext) {
		
	context.subscriptions.push(vscode.commands.registerCommand('image-comparator.openViewer', function () {
		// Open Comparator Window
		ImageViewer.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('image-comparator.addImage', function (uri: vscode.Uri) {
		// Open Comparator Window, in case it's not already open
		ImageViewer.createOrShow(context.extensionUri);

		if (uri != undefined) {
			// Add Image from context menu to Comparator
			ImageViewer.registerImage(uri.fsPath);
		}
		else {
			// Search Dialog to Add N Image(s) to Comparator
			const options: vscode.OpenDialogOptions = {
				canSelectMany: true,
				openLabel: 'Open',
				filters: {
					'Images': ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'],
				}
			};

			vscode.window.showOpenDialog(options).then(fileUri => {
				if (fileUri && fileUri[0]) {
					// Loop through and add each Image to Comparator
					fileUri.forEach( (fileUri_obj) => {
						ImageViewer.registerImage(fileUri_obj.fsPath);
					});
				}
			});
		}
	}));
}
