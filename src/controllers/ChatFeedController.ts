import {ChatFeed} from "../view/components/chat/ChatFeed";
import {ChatModel} from "../models/ChatModel";

interface IMessageData {
	name: string;
	text: string;
}

export class ChatFeedController {
	private _view: ChatFeed;
	private _currentMessageIndex: number;
	private _messagesToShow: IMessageData[];
	readonly _chatModel: ChatModel;

	constructor(view: ChatFeed, chatModel: ChatModel) {
		this._view = view;
		this._chatModel = chatModel;
		this._currentMessageIndex = 0;
		this._messagesToShow = [];
	}

	public async startDialogue(): Promise<void> {
		this._messagesToShow = [...this._chatModel.getMessages()];

		// while (this._messagesToShow.length) {
			const message = this._messagesToShow.shift();
			await this.showMessage(message);
		// }
	}

	private async showMessage(message: IMessageData): Promise<void> {
		await this._view.addMessage(message);
	}

	public updateOnResize(isPortrait: boolean): void {
		this._view.updateMaxWidth(isPortrait);
		this._view.updateMask(isPortrait);
	}
}