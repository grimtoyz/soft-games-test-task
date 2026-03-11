import * as PIXI from 'pixi.js';
import fireSceneConfig from "../../config/scenes/phoenixFlameConfig.json";
import {GameScene} from "./GameScene";
import {Sprite} from 'pixi.js';
import {Fire} from "../components/fire/Fire";

export class FireScene extends GameScene{
	private readonly _app: PIXI.Application;
	private readonly _bg: PIXI.Sprite;

	constructor(name: string, app: PIXI.Application) {
		super(name);

		this._app = app;

		this._bg = Sprite.from('brown_bg');
		this._bg.anchor.set(0.5);
		this._bg.scale.set(2);

		this.addChild(this._bg);
		this._createFire();
	}

	public _createFire(): void {
		const fire = new Fire(this._app);
		this.addChild(fire)

		const {x,y} = fireSceneConfig.fireplace.position;
		fire.position.set(x,y);
	}

	public onEnter(): void {
	}

	public onExit(): void {
	}

	public onResize(isPortrait: boolean): void {
	}
}