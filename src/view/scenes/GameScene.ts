import * as PIXI from 'pixi.js';

export abstract class GameScene extends PIXI.Container {
	protected constructor(name: string) {
		super();
		this.label = name;
	}

	public onEnter();

	public onExit();

	public update(dt: number): void {
	}

	onResize(isPortrait: boolean);
}