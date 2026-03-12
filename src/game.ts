import * as PIXI from 'pixi.js';
import { ResizeManager } from './managers/ResizeManager';
import gameConfig from './config/gameConfig.json';
import { SceneManager } from './managers/SceneManager';
import { AssetLoader } from './assetsLoader/AssetsLoader';
import { PersistentUI } from './view/persistentUI/PersistentUI';
import { CardsScene } from './view/scenes/CardsScene';
import { ChatScene } from './view/scenes/ChatScene';
import { FireScene } from './view/scenes/FireScene';
import { ChatModel } from './models/ChatModel';
// @ts-ignore
import './styles/fonts.css';
import { ResizeModel } from './models/ResizeModel';
import { getAvatarTextureName } from './helpers/text/TextureNameHelper';
import { Assets } from 'pixi.js';
import type { ChatData } from './types/types.ts';

const SCENES = {
  CARDS: 'Ace of Shadows',
  CHAT: 'Magic Words',
  FIRE: 'Phoenix Flame',
};

const SCENES_ORDER = [SCENES.CARDS, SCENES.CHAT, SCENES.FIRE];
export type GameServices = {
  app: PIXI.Application;
  world: PIXI.Container;
  rootElement: HTMLElement;
  eventBus: PIXI.EventEmitter;
  resizeModel: ResizeModel;
  chatModel: ChatModel;
};

export const GAME = {} as GameServices;

export class Game {
  private _app!: PIXI.Application;
  private _world!: PIXI.Container;
  private _resizeManager!: ResizeManager;
  private _resizeModel!: ResizeModel;
  private _sceneManager!: SceneManager;
  private _eventBus!: PIXI.EventEmitter;
  private _chatModel!: ChatModel;
  readonly _rootElement: HTMLElement;

  constructor() {
    const root = document.getElementById('game');
    if (!root) {
      throw new Error('Root element #game not found');
    }
    this._rootElement = root;
    GAME.rootElement = root;
  }

  public async init(): Promise<any> {
    this._app = await this._createPixiApp();
    this._world = new PIXI.Container();
    this._app.stage.addChild(this._world);
    this._app.stage.eventMode = 'static';

    this._eventBus = new PIXI.EventEmitter();

    GAME.app = this._app;
    GAME.world = this._world;
    GAME.eventBus = this._eventBus;

    this._setupModels();

    await AssetLoader.init();
    await AssetLoader.preloadStatic();

    const chatData: ChatData = await this._loadChatData(gameConfig.chatURL);
    this._chatModel.setChatData(chatData);
    this._chatModel.setMessages(chatData.dialogue);
    this._chatModel.setAvatars(chatData.avatars);
    this._chatModel.setEmojis(chatData.emojies);

    await this._loadAssets();
    await document.fonts.load('40px "DIN Condensed"');

    this._setupManagers();
    this._setupScenes();

    // debug resize testing
    this._createSafeFrame();

    this._resizeManager.resize();
  }

  private async _loadAssets(): Promise<void> {
    await AssetLoader.loadAvatarsSequential(this._chatModel.getAvatars());
    await AssetLoader.addDynamicBundle(this._chatModel.getEmojis(), 'emojies');

    const chatData = this._chatModel.getChatData();
    if (!chatData) {
      throw new Error('no chat data set');
    }
    const names = new Set(chatData.dialogue.map((d) => d.name));
    const configuredAvatars = new Set(chatData.avatars.map((a) => a.name));
    const missingNames = [...names].filter((name) => !configuredAvatars.has(name));
    const textureFallback = Assets.get('missing_avatar.png');
    missingNames.forEach((name) => {
      PIXI.Assets.cache.set(getAvatarTextureName(name), textureFallback);
    });

    await AssetLoader.loadRest((progress) => {
      console.log('loading', progress);
    });
  }

  private async _loadChatData(url: string): Promise<ChatData> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load chat data: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as ChatData;
  }

  private _setupModels(): void {
    this._resizeModel = new ResizeModel();
    this._chatModel = new ChatModel();

    GAME.resizeModel = this._resizeModel;
    GAME.chatModel = this._chatModel;
  }

  private _setupManagers(): void {
    const { baseWidth, baseHeight } = gameConfig;

    this._sceneManager = new SceneManager(GAME);

    this._resizeManager = new ResizeManager(GAME, baseWidth, baseHeight);
  }

  private _setupScenes(): void {
    const sceneTitles = [SCENES.CARDS, SCENES.CHAT, SCENES.FIRE];
    const ui = new PersistentUI(
      this._app,
      this._eventBus,
      this._world,
      sceneTitles,
      this.onUIInteract.bind(this)
    );
    this._sceneManager.addPersistentScene(ui);

    const cardsScene = new CardsScene(SCENES.CARDS, GAME);
    this._sceneManager.addScene(cardsScene);

    const chatScene = new ChatScene(SCENES.CHAT, GAME);
    this._sceneManager.addScene(chatScene);

    const fireScene = new FireScene(SCENES.FIRE, GAME);
    this._sceneManager.addScene(fireScene);
  }

  private onUIInteract(payload: number): void {
    this._sceneManager.switchSceneTo(SCENES_ORDER[payload]);
  }

  private _createSafeFrame(): void {
    const frame = PIXI.Sprite.from('safe_frame');
    frame.x = gameConfig.baseWidth * 0.5;
    frame.y = gameConfig.baseHeight * 0.5;
    frame.anchor.set(0.5);
    this._world.addChild(frame);

    frame.visible = false;
  }

  // @ts-ignore
  private async _createPixiApp(): PIXI.Application {
    const app = new PIXI.Application();

    // PIXI inspector
    // @ts-ignore
    globalThis.__PIXI_APP__ = app;

    await app.init({
      resizeTo: this._rootElement,
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb,
      roundPixels: gameConfig.roundPixels,
    });

    this._rootElement.appendChild(app.canvas);

    return app;
  }
}
