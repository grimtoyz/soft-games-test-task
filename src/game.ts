import * as PIXI from 'pixi.js';
import {ResizeManager} from "./managers/ResizeManager";
import gameConfig from './config/gameConfig.json';
import {SceneManager} from "./managers/SceneManager";
import {AssetLoader} from "./assetsLoader/AssetsLoader";
import {PersistentUI} from "./view/persistentUI/PersistentUI";
import {CardsScene} from "./view/scenes/CardsScene";
import {ChatScene} from "./view/scenes/ChatScene";
import {FireScene} from "./view/scenes/FireScene";
import {ChatModel} from "./models/ChatModel";
import '../styles/fonts.css';
import {ResizeModel} from "./models/ResizeModel";

const SCENES = {
	CARDS: 'Ace of Shadows',
	CHAT: 'Magic Words',
	FIRE: 'Phoenix Flame'
}

const SCENES_ORDER = [
	SCENES.CARDS,
	SCENES.CHAT,
	SCENES.FIRE
]

export class Game {
	private _app: PIXI.Application;
	private _world: PIXI.Container;
	private _resizeManager: ResizeManager;
	private _resizeModel: ResizeModel;
	private _sceneManager: SceneManager;
	private _eventBus: PIXI.EventEmitter;
	private _chatModel: ChatModel;
	readonly _rootElement: HTMLElement;

	constructor() {
		this._rootElement = document.getElementById('game');
		if (!this._rootElement) throw new Error('#game container not found');
	}

	public async init(): Promise<any> {
		this._app = await this._createPixiApp();
		this._world = new PIXI.Container();
		this._app.stage.addChild(this._world);
		this._app.stage.roundPixels = gameConfig.roundPixels;
		this._app.stage.eventMode = 'static';

		this._eventBus = new PIXI.EventEmitter<Events>();

		await this._loadAssets();
		await document.fonts.load('40px "DIN Condensed"');

		this._setupManagers();
		this._setupScenes();

		// debug resize testing
		this._createSafeFrame();

		this._resizeManager.resize();
	}

	private async _loadAssets(): Promise<void> {
		await AssetLoader.init();

		const chatData = await this._loadChatData(gameConfig.chatURL);
		this._chatModel = new ChatModel();
		this._chatModel.setMessages(chatData.dialogue);
		this._chatModel.setAvatars(chatData.avatars);

		await AssetLoader.addDynamicBundle(chatData.emojies, 'emojies');
		await AssetLoader.addDynamicBundle(chatData.avatars, 'avatars');

		await AssetLoader.preloadAll((progress) => {
			console.log('loading', progress);
		});
	}

	private async _loadChatData(url: string): Promise<ChatData> {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to load chat data: ${response.status} ${response.statusText}`);
		}

		return (await response.json() as ChatData);
	}

	private _setupManagers(): void {
		const { baseWidth, baseHeight } = gameConfig;

		this._resizeModel = new ResizeModel();
		this._sceneManager = new SceneManager(this._app, this._world, this._eventBus, this._resizeModel);

		this._resizeManager = new ResizeManager(
			this._app,
			this._eventBus,
			this._rootElement,
			this._world,
			this._resizeModel,
			baseWidth,
			baseHeight
		);
	}

	private _setupScenes(): void {
		const sceneTitles = [SCENES.CARDS, SCENES.CHAT, SCENES.FIRE];
		const ui = new PersistentUI(this._app, this._eventBus, this._world, sceneTitles, this.onUIInteract.bind(this));
		this._sceneManager.addPersistentScene(ui);

		const cardsScene = new CardsScene(SCENES.CARDS, this._app, this._resizeModel);
		this._sceneManager.addScene(cardsScene);

		const chatScene = new ChatScene(SCENES.CHAT, this._app, this._chatModel, this._resizeModel);
		this._sceneManager.addScene(chatScene);

		const fireScene = new FireScene(SCENES.FIRE, this._app);
		this._sceneManager.addScene(fireScene);
	}

	private onUIInteract(payload): void {
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

	private async _createPixiApp(): PIXI.Application {
		const app = new PIXI.Application();
		globalThis.__PIXI_APP__ = app;

		await app.init({
			resizeTo: this._rootElement,
			width: 800,
			height: 600,
			backgroundColor: 0x1099bb,
		});

		this._rootElement.appendChild(app.canvas);

		return app;
	}

	public get app(): PIXI.Application {
		return this._app;
	}
}
