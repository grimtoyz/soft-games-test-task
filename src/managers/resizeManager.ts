import { Application, Container } from 'pixi.js';

export class ResizeManager {
	private _resizeObserver: ResizeObserver;
	private _app: Application;
	private _container: HTMLElement;
	private _gameRoot: Container;
	readonly _baseW: number;
	readonly _baseH: number;

	constructor(
		app: Application,
		container: HTMLElement,
		gameRoot: Container,
		baseW: number,
		baseH: number
	) {
		this._app = app;
		this._container = container;
		this._gameRoot = gameRoot;
		this._baseW = baseW;
		this._baseH = baseH;

		this._resizeObserver = new ResizeObserver(() => this.resize());
		this._resizeObserver.observe(container);

		this.resize();
	}

	private resize(): void {
		const w = this._container.clientWidth;
		const h = this._container.clientHeight;
		if (w <= 0 || h <= 0) return;

		this._app.renderer.resize(w, h);

		const isPortrait = h >= w;
		const scale = isPortrait ? h / this._baseH : w / this._baseW;

		this._gameRoot.scale.set(scale);

		const viewW = this._baseW * scale;
		const viewH = this._baseH * scale;

		this._gameRoot.position.set((w - viewW) / 2, (h - viewH) / 2);
	}

	public destroy(): void {
		this._resizeObserver.disconnect();
	}
}