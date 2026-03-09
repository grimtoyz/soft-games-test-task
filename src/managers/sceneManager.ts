import * as PIXI from 'pixi.js';
import {Container} from "pixi.js";
import {CONSTANTS} from "../constants/constants";
import gameConfig from "../config/gameConfig.json";

export class SceneManager {
	private _world: PIXI.Container;
	private _eventBus: PIXI.EventEmitter;
	private _currentScene: PIXI.Container;
	private _nextScene: PIXI.Container;
	private _scenes: PIXI.Container[];
	private _persistentScenes: PIXI.Container[];
	readonly _sceneContainer: PIXI.Container;
	readonly _persistentContainer: PIXI.Container;

	constructor(world: PIXI.Container, eventBus: PIXI.EventEmitter){
		this._world = world;
		this._eventBus = eventBus;
		this._scenes = [];
		this._persistentScenes = [];

		this._sceneContainer = new Container();
		this._world.addChild(this._sceneContainer);

		this._persistentContainer = new Container();
		this._world.addChild(this._persistentContainer);

		// const green = new CardsScene();
		// this._world.addChild(green);
		this._subscribe();
	}

	private _onResizeEvent = (isPortrait: boolean) => {
		const x = isPortrait ? 540 : 960;
		const y = isPortrait ? 960 : 540;
		this._sceneContainer.position.set(960, 540);

		if (this._currentScene) {
			this._currentScene.onResize(isPortrait);
		}

		this._persistentScenes.forEach(scene => {
			console.log('RESIZE PERSISTENT')
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
		}
	}

	addPersistentScene(scene: PIXI.Container): void {
		this._persistentScenes.push(scene);

		this._persistentContainer.addChild(scene);
	}

	public switchSceneTo(sceneToId: string): void {
		const sceneTo = this._scenes.find((scene) => scene.label === sceneToId);

		if (sceneTo) {
			this._nextScene = sceneTo;

			if (this._currentScene) {
				this._sceneContainer.removeChild(this._currentScene)
			}

			this._sceneContainer.addChild(sceneTo);
			this._currentScene = sceneTo;
		}
	}
}