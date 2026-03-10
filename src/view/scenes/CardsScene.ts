import * as PIXI from 'pixi.js';
import gameConfig from "../../config/gameConfig.json";
import {GameScene} from "./GameScene";
import {Card} from "../components/Card";

export class CardsScene extends GameScene {
	constructor(name: string) {
		super(name);

		// this.label = 'CardsScene';

		const bg = PIXI.Sprite.from('green_bg');
		// bg.x = gameConfig.baseWidth * 0.5;
		// bg.y = gameConfig.baseHeight * 0.5;
		bg.anchor.set(0.5);
		this.addChild(bg);

		const card = new Card();
		this.addChild(card)
	}

	public onEnter() {
	}

	public onExit() {
	}

	public onResize(isPortrait: boolean): void {
		console.log('ON RESIZE CHAT SCENE <<<<<<<')
		// const currentTexture = isPortrait ? 'phone_bg_port' : 'phone_bg_land';
		// this._bg.texture = PIXI.Assets.get(currentTexture);
	}
}