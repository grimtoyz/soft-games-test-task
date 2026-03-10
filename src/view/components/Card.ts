import * as PIXI from 'pixi.js';

export class Card extends PIXI.Container {
	private _sprite: PIXI.Sprite;

	constructor() {
		super();

		this._createSprite();
	}

	private _createSprite(): void {
		this._sprite = PIXI.Sprite.from('2C.png');
		this._sprite.anchor.set(0.5);

		this.addChild(this._sprite);
	}
}