import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { Utils } from '../../../utils/Utils.ts';
import { CONSTANTS } from '../../../constants/constants.ts';

export class Deck extends PIXI.Container {
  public getNextPosition(): PIXI.Point {
    const x = this.children.length * 0.2;
    const y = -this.children.length * 0.2;

    return new PIXI.Point(x, y);
  }

  public addCard(card: Card): void {
    if (card.parent !== this) {
      this.reparentChild(card);
    }
  }

  public createCards(amount: number): void {
    for (let i = 0; i < amount; i++) {
      const value = Utils.randomFrom(CONSTANTS.CARDS.VALUES);
      const suit = Utils.randomFrom(CONSTANTS.CARDS.SUITS);
      const textureName = `${value}${suit}.png`;
      const card = new Card(textureName);
      this.addChild(card);
      card.x = i * 0.2;
      card.y = -i * 0.2;
      card.angle = -1 + Math.random() * 2;
    }
  }

  public rearrange(): void {
    this.children.forEach((card, index) => {
      card.x = index * 0.2;
      card.y = -index * 0.2;
      card.scale.set(1);
    });
  }

  public getTopCard(): Card | undefined {
    return this.children.pop() as Card;
  }
}
