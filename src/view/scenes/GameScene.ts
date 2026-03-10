import * as PIXI from 'pixi.js';

export abstract class GameScene extends PIXI.Container {
	protected constructor(name: string) {
		super();
		this.label = name;
	}

	onEnter();

	onExit();

	onResize(isPortrait: boolean);
}