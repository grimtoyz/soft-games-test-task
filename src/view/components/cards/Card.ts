import * as PIXI from 'pixi.js';

export class Card extends PIXI.Container {
	private _sprite: PIXI.Sprite;
	private _textureName: string;
	private _originalPositionPort: PIXI.Point;
	private _originalPositionLand: PIXI.Point;
	private _originalScalePort: number;
	private _originalScaleLand: number;
	private _targetPositionPort: PIXI.Point;
	private _targetPositionLand: PIXI.Point;
	private _targetScalePort: number;
	private _targetScaleLand: number;

	constructor(cardTextureName: string) {
		super();

		this._textureName = cardTextureName;

		this._createSprite();
	}

	private _createSprite(): void {
		this._sprite = PIXI.Sprite.from(this._textureName);
		this._sprite.anchor.set(0.5);

		this.addChild(this._sprite);
	}

	public setOriginalTransforms(
		positionPort: PIXI.Point,
		positionLand: PIXI.Point,
		scalePort: number,
		scaleLand: number,
	): void {
		this._originalPositionPort = positionPort;
		this._originalPositionLand = positionLand;
		this._originalScalePort = scalePort;
		this._originalScaleLand = scaleLand;
	}

	public setTargetTransforms(
		positionPort: PIXI.Point,
		positionLand: PIXI.Point,
		scalePort: number,
		scaleLand: number,
	): void {
		this._targetPositionPort = positionPort;
		this._targetPositionLand = positionLand;
		this._targetScalePort = scalePort;
		this._targetScaleLand = scaleLand;
	}

	public getOriginalPositionPort(): PIXI.Point {
		return this._originalPositionPort;
	}

	public getOriginalPositionLand(): PIXI.Point {
		return this._originalPositionLand;
	}

	public getTargetPositionPort(): PIXI.Point {
		return this._targetPositionPort;
	}

	public getTargetPositionLand(): PIXI.Point {
		return this._targetPositionLand;
	}

	public getOriginalScalePort(): number {
		return this._originalScalePort;
	}

	public getOriginalScaleLand(): number {
		return this._originalScaleLand;
	}

	public getTargetScalePort(): number {
		return this._targetScalePort;
	}

	public getTargetScaleLand(): number {
		return this._targetScaleLand;
	}

	public getTexture(): PIXI.Texture {
		return this._sprite.texture;
	}

	public setTexture(texture: PIXI.Texture): void {
		this._sprite.texture = texture;
	}
}