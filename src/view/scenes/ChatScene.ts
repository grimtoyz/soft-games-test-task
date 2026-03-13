import * as PIXI from 'pixi.js';
import { GameScene } from './GameScene';
import { ChatModel } from '../../models/ChatModel';
import { ChatFeed } from '../components/chat/ChatFeed';
import { ChatFeedController } from '../../controllers/ChatFeedController';
import { ResizeModel } from '../../models/ResizeModel';
import type { GameServices } from '../../game.ts';

export class ChatScene extends GameScene {
  private _chatController: ChatFeedController;
  readonly _app: PIXI.Application;
  readonly _resizeModel: ResizeModel;
  readonly _chatModel: ChatModel;
  readonly _chatFeedView: ChatFeed;
  readonly _bg: PIXI.Sprite;

  constructor(name: string, gameServices: GameServices) {
    super(name);

    this._app = gameServices.app;
    this._chatModel = gameServices.chatModel;
    this._resizeModel = gameServices.resizeModel;

    this._bg = PIXI.Sprite.from('phone_bg_land');
    this._bg.anchor.set(0.5);
    this.addChild(this._bg);

    this._chatFeedView = new ChatFeed(gameServices);
    this.addChild(this._chatFeedView);

    this._chatController = new ChatFeedController(this._chatFeedView, this._chatModel);
  }

  public override onEnter(): void {
    this._chatController.startDialogue();
  }

  public override onExit(): void {
    this._chatController.resetDialogue();
  }

  public update(): void {}

  public override onResize(isPortrait: boolean): void {
    const currentTexture = isPortrait ? 'phone_bg_port' : 'phone_bg_land';

    this._bg.texture = PIXI.Assets.get(currentTexture);
    this._chatController.updateOnResize(isPortrait);
  }
}
