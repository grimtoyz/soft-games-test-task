import * as PIXI from 'pixi.js';
import {
	Assets,
	Sprite,
	TextStyle,
	Graphics,
	Container
} from 'pixi.js';
import magicWordsConfig from "../../config/magicWordsConfig.json";
import {GameScene} from "./GameScene";
import {ChatMessage} from "../components/chat/ChatMessage";
import {ChatModel} from "../../models/ChatModel";

export class ChatScene extends GameScene{
	private _chatModel: ChatModel;
	private _messages: ChatMessage[];
	private _chatScreenMask: Sprite;
	private _chatFeedContainer: Container;
	readonly _bg: PIXI.Sprite;

	constructor(name: string, chatModel: ChatModel) {
		super(name);

		this._chatModel = chatModel;
		this._messages = [];

		this._bg = PIXI.Sprite.from('phone_bg_land');
		this._bg.anchor.set(0.5);
		this.addChild(this._bg);

		const { textStyle, maxTextWidth, emojiSize, textOffsetX } = magicWordsConfig.chatBubble;

		this._chatFeedContainer = new Container();
		this.addChild(this._chatFeedContainer);

		// this._chatScreenMask = new Graphics()
		// 	.roundRect(-250, -50, 500, 1200, 20)
		// 	.fill({ color: 0x1e1b22, alpha: 0.7 })
		this._chatScreenMask = new Graphics();
		this.addChild(this._chatScreenMask);

		// const testAvatar = PIXI.Sprite.from('avatars-sheldon');
		// this.addChild(testAvatar)
		const messageView = new ChatMessage({
			avatarTexture: Assets.get('avatars-sheldon'),
			bubbleTexture: Assets.get('chat_bubble_nineslice_left.png'),
			emojiTextures: {
				sad: Assets.get('emojies-sad'),
				satisfied: Assets.get('emojies-satisfied'),
			},
			textStyle: new TextStyle(textStyle),
			message: this._chatModel.getMessage(0),
			maxTextWidth: maxTextWidth.land,
			textOffsetX,
			emojiSize
		});
		this._messages.push(messageView);

		messageView.x = -460;
		messageView.y = -190;

		this.addChild(messageView);
	}

	public override onEnter(): void {

	}

	public override onExit(): void {

	}

	displayNextMessage(): void {

	}

	public override onResize(isPortrait: boolean): void {
		const { maxTextWidth } = magicWordsConfig.chatBubble;
		const currentTexture = isPortrait ? 'phone_bg_port' : 'phone_bg_land';
		this._bg.texture = PIXI.Assets.get(currentTexture);

		const {chatFeedWindow} = magicWordsConfig;
		const maskWidth = isPortrait ? chatFeedWindow.port.width : chatFeedWindow.land.width;
		const maskHeight = isPortrait ? chatFeedWindow.port.height : chatFeedWindow.land.height;
		const maskX = -maskWidth * 0.5;
		const offsetY = isPortrait ? chatFeedWindow.port.offsetY : chatFeedWindow.land.offsetY;
		const maskY = -maskHeight * 0.5 + offsetY;
		this._chatScreenMask.clear()
			.roundRect(maskX, maskY, maskWidth, maskHeight, 24)
			.fill({ color: 0xff0000, alpha: 0.7 })

		this._messages.forEach(message => {
			const maxWidth = isPortrait ? maxTextWidth.port : maxTextWidth.land;
			message.setMaxTextWidth(maxWidth);
		});
	}
}