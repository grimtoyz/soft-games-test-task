import * as PIXI from 'pixi.js';
import fireSceneConfig from "../../config/scenes/phoenixFlameConfig.json";
import {GameScene} from "./GameScene";
import {Sprite} from 'pixi.js';
import {Fire} from "../components/fire/Fire";

export class FireScene extends GameScene{
	private readonly _app: PIXI.Application;
	private readonly _bg: PIXI.Sprite;
	private _fire: Fire;

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
		this._fire = new Fire(this._app);
		this.addChild(this._fire)

		const {x,y} = fireSceneConfig.fireplace.position;
		this._fire.position.set(x,y);
	}

	public onEnter(): void {
		this._ticker = (ticker) => {
			this._fire.update(ticker.deltaMS / 1000);
		};

		this._app.ticker.add(this._emitterTicker);
	}

	public onExit(): void {
	}

	public update(dt: number): void {
		this._fire.update(dt);
	}

	public onResize(isPortrait: boolean): void {
	}
}