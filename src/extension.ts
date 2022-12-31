import * as vscode from 'vscode';
import { ImageViewer } from './image_viewer.js';



export function activate(context: vscode.ExtensionContext) {
	
	context.subscriptions.push(vscode.commands.registerCommand('image-comparator.openViewer', function () {
		// Open Comparator Window
		ImageViewer.createOrShow(context.extensionUri);
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('image-comparator.addImage', async (...inputArgs) => {
		// https://stackoverflow.com/a/70307717/7861160
		// Open Comparator Window, in case it's not already open
		ImageViewer.createOrShow(context.extensionUri);
		
		// Loop over all images in context menu list
		if (inputArgs[0] != undefined) {
			inputArgs[1].forEach((uri: vscode.Uri) => {
				if (uri instanceof vscode.Uri) {
					console.log(uri.fsPath);
					ImageViewer.registerImage(uri.fsPath);
				}
			});
		}
		else {
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
