import { Application, Container, EventEmitter } from 'pixi.js';
import { CONSTANTS } from '../constants/constants';
import { ResizeModel } from '../models/ResizeModel';
import type { GameServices } from '../game.ts';

export class ResizeManager {
  private _resizeObserver: ResizeObserver;
  private _app: Application;
  private _gameRoot: Container;
  private _resizeModel: ResizeModel;
  private readonly _container: HTMLElement;
  private readonly _baseW: number;
  private readonly _baseH: number;
  private readonly _eventBus: EventEmitter;

  constructor(gameServices: GameServices, baseW: number, baseH: number) {
    this._app = gameServices.app;
    this._eventBus = gameServices.eventBus;
    this._container = gameServices.rootElement;
    this._gameRoot = gameServices.world;
    this._resizeModel = gameServices.resizeModel;
    this._baseW = baseW;
    this._baseH = baseH;

    this._resizeObserver = new ResizeObserver(() => this.resize());
    this._resizeObserver.observe(this._container);

    this.resize();
  }

  public resize(): void {
    const w = this._container.clientWidth;
    const h = this._container.clientHeight;
    if (w <= 0 || h <= 0) return;

    this._app.renderer.resize(w, h);

    const isPortrait = h >= w;
    const maxSide = Math.max(this._baseH, this._baseW);
    const scale = isPortrait ? h / maxSide : w / maxSide;

    this._gameRoot.scale.set(scale);

    const viewW = this._baseW * scale;
    const viewH = this._baseH * scale;

    this._gameRoot.position.set((w - viewW) / 2, (h - viewH) / 2);
    this._resizeModel.isPortrait = isPortrait;

    this._eventBus.emit(CONSTANTS.EVENTS.RESIZE, isPortrait);
  }

  public destroy(): void {
    this._resizeObserver.disconnect();
  }
}
