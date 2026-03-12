import { Container, NineSliceSprite, Sprite, TextStyle, Texture } from 'pixi.js';
import gsap from 'gsap';
import { parseMessageToTokens } from '../../../helpers/text/ChatTokensParser';
import { layoutInlineTokens } from '../../../helpers/text/LayoutHelper';
import magicWordsConfig from '../../../config/scenes/magicWordsConfig.json';

type ChatMessageViewOptions = {
  avatarTexture: Texture;
  avatarPosition: 'left' | 'right';
  bubbleTexture: Texture;
  message: string;

  maxTextWidth?: number;
  textOffsetX?: number;
  avatarSize?: number;
  emojiSize?: number;
  gap?: number;
  paddingX?: number;
  paddingY?: number;

  bubbleSliceLeft?: number;
  bubbleSliceTop?: number;
  bubbleSliceRight?: number;
  bubbleSliceBottom?: number;

  textStyle?: TextStyle;
};

export class ChatMessage extends Container {
  private _maxTextWidth: number;
  private _currentMessage: string = '';

  readonly _avatarContainer: Container;
  readonly _avatar: Sprite;
  readonly _messageContainer: Container;
  readonly _bubble: NineSliceSprite;
  readonly _content: Container;
  readonly _textOffsetX: number;
  readonly _avatarPosition: string;
  readonly avatarSize: number;
  readonly emojiSize: number;
  readonly gap: number;
  readonly paddingX: number;
  readonly paddingY: number;
  readonly textStyle: TextStyle;

  constructor(options: ChatMessageViewOptions) {
    super();

    this._avatarPosition = options.avatarPosition;

    this._maxTextWidth = options.maxTextWidth ?? 100;
    this._textOffsetX = options.textOffsetX ?? 0;
    this.avatarSize = options.avatarSize ?? 100;
    this.emojiSize = options.emojiSize ?? 20;
    this.gap = options.gap ?? -40;
    this.paddingX = options.paddingX ?? 50;
    this.paddingY = options.paddingY ?? 30;

    this.textStyle =
      options.textStyle ??
      new TextStyle({
        fontFamily: 'Arial',
        fontSize: 60,
        fill: 0x1f2937,
        lineHeight: 24,
        breakWords: true,
      });

    this._avatarContainer = new Container();

    const avatarBg = Sprite.from('avatar_bg.png');
    avatarBg.anchor.set(0.5);
    this._avatarContainer.addChild(avatarBg);

    this._avatar = new Sprite(options.avatarTexture);
    this._avatar.anchor.set(0.5);
    this._avatar.width = this.avatarSize;
    this._avatar.height = this.avatarSize;
    this._avatar.x = 0;
    this._avatar.y = 0;
    this._avatarContainer.addChild(this._avatar);

    this._messageContainer = new Container();

    const isLeft = this._avatarPosition === 'left';
    this._bubble = new NineSliceSprite({
      texture: options.bubbleTexture,
      leftWidth: isLeft ? 56 : 40,
      topHeight: options.bubbleSliceTop ?? 77,
      rightWidth: isLeft ? 40 : 56,
      bottomHeight: options.bubbleSliceBottom ?? 40,
    });

    this._content = new Container();

    this.addChild(this._avatarContainer, this._messageContainer);
    this._messageContainer.addChild(this._bubble);
    this._messageContainer.addChild(this._content);

    this.setMessage(options.message);
  }

  public setMessage(message: string): void {
    this._content.removeChildren();
    this._currentMessage = message;

    const tokens = parseMessageToTokens(message);

    const layout = layoutInlineTokens({
      tokens,
      maxWidth: this._maxTextWidth,
      textStyle: this.textStyle,
      emojiSize: this.emojiSize,
    });

    // TODO: enums instead of strings
    const isLeft = this._avatarPosition === 'left';
    const bubbleX = isLeft ? this.avatarSize + this.gap : -this.avatarSize - this.gap;
    const bubbleY = -55;

    this._messageContainer.x = bubbleX;
    this._messageContainer.y = bubbleY;
    this._bubble.width = layout.width + this.paddingX * 2;
    this._bubble.x = isLeft ? 0 : -this._bubble.width;
    this._bubble.height = layout.height + this.paddingY * 2;

    this._content.x = isLeft ? this._textOffsetX : -this._bubble.width - this._textOffsetX;

    for (const item of layout.items) {
      item.displayObject.position.x += this.paddingX;
      item.displayObject.position.y += this.paddingY;
      this._content.addChild(item.displayObject);
    }
  }

  public async playAnimation(): Promise<void> {
    this._content.alpha = 0;
    this._avatarContainer.alpha = 0;
    this._bubble.scale.set(0.01);

    let timeline = gsap.timeline();

    timeline.to(this._avatarContainer, {
      alpha: 1,
      duration: magicWordsConfig.chatBubble.avatarEnterDuration,
      ease: 'power2.out',
    });

    timeline.to(
      this._bubble.scale,
      {
        x: 1,
        y: 1,
        duration: 0.45,
        ease: 'elastic.out(0.6)',
      },
      '<'
    );

    timeline.to(
      this._content,
      {
        alpha: 1,
        duration: 0.26,
        delay: 0.2,
        ease: 'power2.out',
      },
      '<'
    );

    // return timeline
  }

  public setMaxTextWidth(width: number): void {
    this._maxTextWidth = width;
    this.relayout();
  }

  private relayout(): void {
    this.setMessage(this._currentMessage);

    this.layout = {
      width: this.width,
      height: this.height,
      objectFit: 'cover',
    };
  }

  public get avatarPosition(): string {
    return this._avatarPosition;
  }
}
