import * as PIXI from 'pixi.js';
import {ResizeManager} from "./managers/resizeManager";

export class Game {
	private _app: PIXI.Application;
	private _world: PIXI.Container;
	private _resizeManager: ResizeManager;

	constructor() {
	}

	public async init(): Promise<any> {
		const rootEl = document.getElementById('game');
		if (!rootEl) throw new Error('#game container not found');

		this._app = await this._createPixiApp(rootEl);
		this._world = new PIXI.Container();
		this._app.stage.addChild(this._world);

		this._resizeManager = new ResizeManager(this._app, rootEl, this._world, 1920, 1080);

		this._createSafeFrame();
	}

	private _createSafeFrame(): void {
		const rect = new PIXI.Graphics()
			.rect(0, 0, 1920, 1080)
			.fill({color: 0xff0000, alpha: 0.3})
			.stroke({ width: 2, color: 0xff0000 });

		this._world.addChild(rect);
	}

	private async _createPixiApp(parent: HTMLElement): PIXI.Application {
		const app = new PIXI.Application();
		globalThis.__PIXI_APP__ = app;

		await app.init({
			resizeTo: parent,
			width: 800,
			height: 600,
			backgroundColor: 0x1099bb,
		});

		parent.appendChild(app.canvas);

		return app;
	}

	public get app(): PIXI.Application {
		return this._app;
	}
}
