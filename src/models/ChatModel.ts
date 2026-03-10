export interface IMessageData {
	name: string,
	text: string
}

export interface IAvatarData {
	name: string,
	position: string,
	text: string
}

export class ChatModel {
	private _messages: IMessageData[];
	private _avatars: IAvatarData[];

	constructor() {
		this._messages = [];
		this._avatars = [];
	}

	setAvatars(data: IAvatarData): void {
		this._avatars = [ ...data ];
	}

	getAvatarDataByName(name: string): IAvatarData {
		const avatarData: IAvatarData = this._avatars.find(avatar => {
			return avatar.name === name;
		});

		return avatarData;
	}

	setMessages(data: IDialogueMessage[]): void {
		this._messages = [...data];
	}

	getMessages(): IMessageData[] {
		return  this._messages;
	}

	getMessage(index: number): string {
		const message = this._messages[index].text;

		return message
	}
}