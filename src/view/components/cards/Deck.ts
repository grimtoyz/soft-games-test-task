import * as PIXI from 'pixi.js';
import {Card} from "./Card";
import aceOfShadows from "../../../config/scenes/aceOfShadowsConfig.json";


export class Deck extends PIXI.Container {
	readonly _cards: Card[];

	constructor() {
		super();

		this._cards = [];
	}

	public getNextPosition(): PIXI.Point {
		const x = this.children.length * 0.2;
		const y = -this.children.length * 0.2;

		return new PIXI.Point(x, y);
	}

	public createCards(amount: number): void {
		const { cardTextureNames } = aceOfShadows;

		for (let i = 0; i < amount; i++) {
			const textureName = cardTextureNames[Math.floor(Math.random() * cardTextureNames.length)];
			const card = new Card(textureName);
			this.addChild(card);
			card.x = i * 0.2;
			card.y = -i * 0.2;
			card.angle = -1 + Math.random() * 2;

			this._cards.push(card);
		}
	}

	public getTopCard(): Card {
		return this._cards.pop();
	}
}