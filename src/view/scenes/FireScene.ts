import * as PIXI from 'pixi.js';
import fireSceneConfig from "../../config/fireSceneConfig.json";
import {GameScene} from "./GameScene";
import {Sprite} from 'pixi.js';

export class FireScene extends GameScene{
	private _fire: PIXI.Sprite;
	readonly _bg: PIXI.Sprite;

	constructor(name: string) {
		super(name);

		this._bg = Sprite.from('brown_bg');
		this._bg.anchor.set(0.5);
		this._bg.scale.set(2);

		this.addChild(this._bg);
		this._createFireplace();
	}

	public _createFireplace(): void {
		this._fire = Sprite.from('fireplace.png')
		this._fire.anchor.set(0.5, 0.8);
		const {x,y} = fireSceneConfig.fireplace.position;
		this._fire.position.set(x,y);

		this.addChild(this._fire);
	}

	public onEnter(): void {
	}

	public onExit(): void {
	}

	public onResize(isPortrait: boolean): void {
	}
}