import * as PIXI from 'pixi.js';
import {Container} from "pixi.js";
import {CONSTANTS} from "../constants/constants";
import gameConfig from '../config/gameConfig.json';
import {ResizeModel} from "../models/ResizeModel";

export class SceneManager {
	private _app: PIXI.Application;
	private _world: PIXI.Container;
	private _eventBus: PIXI.EventEmitter;
	private _resizeModel: ResizeModel;
	private _currentScene: PIXI.Container;
	private _nextScene: PIXI.Container;
	private _scenes: PIXI.Container[];
	private _ticker!: (ticker: PIXI.Ticker) => void;
	private _persistentScenes: PIXI.Container[];
	readonly _sceneContainer: PIXI.Container;
	readonly _persistentContainer: PIXI.Container;

	constructor(app: PIXI.Application, world: PIXI.Container, eventBus: PIXI.EventEmitter, resizeModel: ResizeModel){
		this._app = app;
		this._world = world;
		this._eventBus = eventBus;
		this._resizeModel = resizeModel;
		this._scenes = [];
		this._persistentScenes = [];

		this._sceneContainer = new Container();
		this._world.addChild(this._sceneContainer);

		this._persistentContainer = new Container();
		this._persistentContainer.layout = {
			width: '100%',
			height: '100%'
		}
		this._world.addChild(this._persistentContainer);

		this._ticker = (ticker) => {
			this._update(ticker.deltaMS / 1000);
		};

		this._app.ticker.add(this._ticker);

		this._subscribe();
	}

	private _onResizeEvent = (isPortrait: boolean) => {
		const { baseWidth, baseHeight} = gameConfig;
		this._sceneContainer.position.set(baseWidth * 0.5, baseHeight * 0.5);

		this._scenes.forEach(scene => {
			scene.onResize(isPortrait);
		});

		this._persistentScenes.forEach(scene => {
			scene.onResize(isPortrait);
		})
	}

	private _subscribe(): void {
		this._eventBus.on(CONSTANTS.EVENTS.RESIZE, this._onResizeEvent);
	}

	unsubscribe(): void {
		this._eventBus.off(CONSTANTS.EVENTS.RESIZE, this._onResizeEvent);
	}

	addScene(scene: PIXI.Container): void {
		this._scenes.push(scene);

		if (!this._currentScene) {
			this._currentScene = scene;
			this._sceneContainer.addChild(scene);
			this._currentScene.onEnter();
		}
	}

	addPersistentScene(scene: PIXI.Container): void {
		this._persistentScenes.push(scene);

		this._persistentContainer.addChild(scene);
	}

	public switchSceneTo(sceneToId: string): void {
		const sceneTo = this._scenes.find((scene) => scene.label === sceneToId);

		if (sceneTo && sceneTo !== this._currentScene) {
			this._nextScene = sceneTo;

			if (this._currentScene) {
				this._sceneContainer.removeChild(this._currentScene)
			}

			this._currentScene.onExit();

			this._sceneContainer.addChild(sceneTo);
			this._currentScene = sceneTo;

			this._currentScene.onEnter();
		}
	}

	private _update(dt: number): void {
		if (this._currentScene) {
			this._currentScene.update(dt);
		}
	}
}