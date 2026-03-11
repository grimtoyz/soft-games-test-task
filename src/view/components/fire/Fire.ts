import * as PIXI from 'pixi.js';
import {FireEmitter} from "./FireEmitter";
import {Sprite} from "pixi.js";
import fireSceneConfig from "../../../config/scenes/phoenixFlameConfig.json";

export class Fire extends PIXI.Container {
	private _app: PIXI.Application;
	private _fire: PIXI.Sprite;

	constructor(app: PIXI.Application) {
		super();

		this._app = app;

		this._createFireplace();
		this._createEmitter();
	}

	public _createFireplace(): void {
		this._fire = Sprite.from('fireplace.png')
		this._fire.anchor.set(0.5, 0.8);

		this.addChild(this._fire);
	}

	private _createEmitter(): void {
		const emitter = new FireEmitter({ texture: PIXI.Assets.get('fire_particle_type_с.png')});
		emitter.scale.set(1.4);
		emitter.position.y = -140;

		this.addChild(emitter);

		this._app.ticker.add((ticker) => {
			emitter.update(ticker.deltaMS / 1000);
		});
	}
}