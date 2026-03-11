import * as PIXI from 'pixi.js';
import {ChatFeed} from "../view/components/chat/ChatFeed";
import {ChatModel} from "../models/ChatModel";
import {Utils} from "../utils/Utils";

interface IMessageData {
	name: string;
	text: string;
}

export class ChatFeedController {
	private _app: PIXI.Application;
	private _view: ChatFeed;
	private _messagesToShow: IMessageData[];
	readonly _chatModel: ChatModel;

	constructor(app: PIXI.Application, view: ChatFeed, chatModel: ChatModel) {
		this._app = app;
		this._view = view;
		this._chatModel = chatModel;
		this._messagesToShow = [];
	}

	public async startDialogue(): Promise<void> {
		this._messagesToShow = [...this._chatModel.getMessages()];

		while (this._messagesToShow.length) {
			const message = this._messagesToShow.shift();
			await this.showMessage(message);
		}
	}

	public resetDialogue(): void {
		this._messagesToShow = [];
		this._view.reset();
	}

	private async showMessage(message: IMessageData): Promise<void> {
		const avatarData = this._chatModel.getAvatarDataByName(message.name);

		this._view.addMessage(message, avatarData);
		await this._view.scroll();
	}

	public async updateOnResize(isPortrait: boolean): void {
		this._view.onResize(isPortrait);
		this._view.updateMaxWidth(isPortrait);
		this._view.updateMask(isPortrait);

		await Utils.nextTick(this._app);

		this._view.updateFeedPosition(isPortrait);
	}
}