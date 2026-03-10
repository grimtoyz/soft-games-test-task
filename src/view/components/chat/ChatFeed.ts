import {
	Container,
	Sprite,
	TextStyle,
	Graphics,
	Assets,
	Texture
} from 'pixi.js';
import gsap from "gsap";
import {ChatMessage} from "./ChatMessage";
import magicWordsConfig from "../../../config/magicWordsConfig.json";
import {ResizeModel} from "../../../models/ResizeModel";

interface IMessageData {
	name: string;
	text: string;
}

interface IAvatarData {
	name: string;
	position: string;
	text: string;
}

export class ChatFeed extends Container {
	private _messages: ChatMessage[];
	private _chatScreenMask: Sprite;
	private _chatFeedContainer: Container;
	private _isPortrait: boolean;
	private _resizeModel: ResizeModel;
	private _currentFeedLengthPort: number;
	private _currentFeedLengthLand: number;

	constructor(resizeModel: ResizeModel) {
		super();

		this._resizeModel = resizeModel;
		this._messages = [];
		this._currentFeedLengthPort = 0;
		this._currentFeedLengthLand = 0;

		this._createView();
	}

	private _createView(): void {
		this._chatFeedContainer = new Container({
			layout: {
				width: '100%',
				flexDirection: 'column',
				flexWrap: 'nowrap',
				gap: '20'
			}
		});
		this.addChild(this._chatFeedContainer);

		this._chatScreenMask = new Graphics();
		this.addChild(this._chatScreenMask);
		this.mask = this._chatScreenMask;
	}

	public async addMessage(message: IMessageData, avatarData: IAvatarData): Promise<void> {
		const { textStyle, maxTextWidth, emojiSize, textOffsetX } = magicWordsConfig.chatBubble;
		const {name, text} = message;
		const avatarPosition = avatarData?.position ?? 'left';
		const chatBubbleTextureName = `chat_bubble_nineslice_${avatarPosition}.png`;
		const messageView = new ChatMessage({
			avatarTexture: Assets.get(`avatars-${name.toLowerCase()}`) || Assets.get(`missing_avatar.png`),
			avatarPosition,
			bubbleTexture: Assets.get(chatBubbleTextureName),
			emojiTextures: {
				sad: this._getEmojiTexture('emojies-sad'),
				neutral: this._getEmojiTexture('emojies-neutral'),
				satisfied: this._getEmojiTexture('emojies-satisfied'),
				laughing: this._getEmojiTexture('emojies-laughing'),
				affirmative: this._getEmojiTexture('emojies-affirmative'),
				satisfied: this._getEmojiTexture('emojies-satisfied'),
				intrigued: this._getEmojiTexture('emojies-intrigued'),
			},
			textStyle: new TextStyle(textStyle),
			message: text,
			maxTextWidth: maxTextWidth.land,
			textOffsetX,
			emojiSize
		});
		this._messages.push(messageView);

		this._chatFeedContainer.addChild(messageView);

		this.updateMaxWidth(this._resizeModel.isPortrait);

		this._chatFeedContainer.layout.forceUpdate();
		await messageView.playAnimation();
	}

	private _getEmojiTexture(key: string): Texture {
		return Assets.get(key) || Assets.get('missing_image.png');
	}

	public async scroll(): Promise<void> {
		const state = { progress: 0 };
		const height = this._chatFeedContainer.height;
		const timeline = new gsap.timeline({onUpdate: () => {
			this._chatFeedContainer.position.y =
				gsap.utils.interpolate(this._chatFeedContainer.y, -height, state.progress);
		}});

		timeline.to(state, { progress: 1, duration: 1 });
		return timeline;
	}

	public updateMaxWidth(isPortrait: boolean): void {
		this._isPortrait = isPortrait;
		const { maxTextWidth, messageOffsetX } = magicWordsConfig.chatBubble;
		this._messages.forEach(message => {
			const maxWidth = isPortrait ? maxTextWidth.port : maxTextWidth.land;
			message.setMaxTextWidth(maxWidth);
			const isLeft = message.avatarPosition === 'left';
			const xLeft = isPortrait ? messageOffsetX.left.port : messageOffsetX.left.land;
			const xRight = isPortrait ? messageOffsetX.right.port : messageOffsetX.right.land;
			message.position.x = isLeft ? xLeft : xRight;
		});
	}

	public updateMask(isPortrait: boolean): void {
		const {chatFeedWindow} = magicWordsConfig;
		const maskWidth = isPortrait ? chatFeedWindow.port.width : chatFeedWindow.land.width;
		const maskHeight = isPortrait ? chatFeedWindow.port.height : chatFeedWindow.land.height;
		const maskX = -maskWidth * 0.5;
		const offsetY = isPortrait ? chatFeedWindow.port.offsetY : chatFeedWindow.land.offsetY;
		const maskY = -maskHeight * 0.5 + offsetY;
		this._chatScreenMask.clear()
			.roundRect(maskX, maskY, maskWidth, maskHeight, 24)
			.fill({ color: 0xff0000, alpha: 0.7 })
	}
}