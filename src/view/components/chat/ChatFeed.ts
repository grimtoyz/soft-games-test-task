import { Container, Graphics, TextStyle, Assets, Application } from 'pixi.js';
import gsap from 'gsap';
import { ChatMessage } from './ChatMessage';
import magicWordsConfig from '../../../config/scenes/magicWordsConfig.json';
import { ResizeModel } from '../../../models/ResizeModel';
import { getAvatarTextureName } from '../../../helpers/text/TextureNameHelper';
import { AVATAR_POSITIONS } from '../../../enums/enums.ts';
import type { AvatarData, AvatarPosition } from '../../../types/types.ts';
import type { GameServices } from '../../../game.ts';

interface IMessageData {
  name: string;
  text: string;
}

export class ChatFeed extends Container {
  private _app: Application;
  private _messages: ChatMessage[];
  private _chatScreenMask!: Graphics;
  private _scrollContainer!: Container;
  public _chatFeedContainer!: Container;
  private _isPortrait!: boolean;
  private _resizeModel: ResizeModel;
  private _scrollTimeline!: gsap.core.Timeline;
  private _state: { progress: 0 };

  constructor(gameServices: GameServices) {
    super();

    this._app = gameServices.app;
    this._resizeModel = gameServices.resizeModel;
    this._state = { progress: 0 };
    this._messages = [];

    this._createView();
  }

  private _createView(): void {
    this._scrollContainer = new Container({
      label: 'ChatScrollContainer',
    });
    this.addChild(this._scrollContainer);

    this._chatFeedContainer = new Container({
      label: 'ChatFeedFlex',
      layout: {
        width: '100%',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        gap: 20,
      },
    });
    this._scrollContainer.addChild(this._chatFeedContainer);

    this._chatScreenMask = new Graphics();
    this.addChild(this._chatScreenMask);
    this.mask = this._chatScreenMask;
  }

  public reset(): void {
    if (this._scrollTimeline) {
      this._scrollTimeline.kill();
    }

    this._chatFeedContainer.removeChildren();
    this._messages = [];
  }

  public async addMessage(
    message: IMessageData,
    avatarData: AvatarData | undefined
  ): Promise<void> {
    const { textStyle, maxTextWidth, emojiSize, textOffsetX } = magicWordsConfig.chatBubble;
    const { name, text } = message;
    const avatarPosition: AvatarPosition = avatarData?.position ?? AVATAR_POSITIONS.LEFT;
    const chatBubbleTextureName = `chat_bubble_nineslice_${avatarPosition}.png`;
    const messageView = new ChatMessage({
      avatarTexture: Assets.get(getAvatarTextureName(name)),
      avatarPosition,
      bubbleTexture: Assets.get(chatBubbleTextureName),
      textStyle: new TextStyle(textStyle),
      message: text,
      maxTextWidth: maxTextWidth.land,
      textOffsetX,
      emojiSize,
    });
    this._messages.push(messageView);

    this._chatFeedContainer.addChild(messageView);

    this.updateMaxWidth(this._resizeModel.isPortrait);

    if (this._chatFeedContainer && this._chatFeedContainer.layout) {
      this._chatFeedContainer.layout.forceUpdate();
    }

    this._state.progress = 0;
    await messageView.playAnimation();
  }

  public async scroll(): Promise<void> {
    this._state = { progress: 0 };
    this._scrollTimeline = new gsap.core.Timeline({
      onUpdate: () => {
        this.updateFeedPosition(this._isPortrait);
      },
    });

    await this._scrollTimeline.to(this._state, {
      progress: 1,
      duration: 1,
      onComplete: () => {
        this._scrollTimeline.kill();
      },
    });
  }

  public onResize(isPortrait: boolean): void {
    this._isPortrait = isPortrait;
  }

  public updateFeedPosition(isPortrait: boolean, forceRender: boolean = false): void {
    const { chatFeedWindow } = magicWordsConfig;
    const viewHeight = isPortrait ? chatFeedWindow.port.height : chatFeedWindow.land.height;

    if (forceRender) {
      this._chatFeedContainer.layout?.forceUpdate();
      this._app.renderer.render(this._app.stage);
    }
    this._scrollContainer.position.y = Math.min(
      0,
      viewHeight * 0.5 - this._chatFeedContainer.height
    );
  }

  public updateMaxWidth(isPortrait: boolean): void {
    const { maxTextWidth, messageOffsetX } = magicWordsConfig.chatBubble;
    this._messages.forEach((message) => {
      const maxWidth = isPortrait ? maxTextWidth.port : maxTextWidth.land;
      message.setMaxTextWidth(maxWidth);
      const isLeft = message.avatarPosition === AVATAR_POSITIONS.LEFT;
      const xLeft = isPortrait ? messageOffsetX.left.port : messageOffsetX.left.land;
      const xRight = isPortrait ? messageOffsetX.right.port : messageOffsetX.right.land;
      message.position.x = isLeft ? xLeft : xRight;
    });
  }

  public updateMask(isPortrait: boolean): void {
    const { chatFeedWindow } = magicWordsConfig;
    const maskWidth = isPortrait ? chatFeedWindow.port.width : chatFeedWindow.land.width;
    const maskHeight = isPortrait ? chatFeedWindow.port.height : chatFeedWindow.land.height;
    const maskX = -maskWidth * 0.5;
    const offsetY = isPortrait ? chatFeedWindow.port.offsetY : chatFeedWindow.land.offsetY;
    const maskY = -maskHeight * 0.5 + offsetY;
    this._chatScreenMask
      .clear()
      .roundRect(maskX, maskY, maskWidth, maskHeight, 24)
      .fill({ color: 0xff0000, alpha: 0.7 });
  }
}
