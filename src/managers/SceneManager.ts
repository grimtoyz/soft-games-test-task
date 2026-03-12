import * as PIXI from 'pixi.js';
import { Container, Graphics } from 'pixi.js';
import { CONSTANTS } from '../constants/constants';
import gameConfig from '../config/gameConfig.json';
import type { GameScene } from '../view/scenes/GameScene.ts';
import type { GameServices } from '../game.ts';
import { transitions } from './transitionManager.ts';
import gsap from 'gsap';

export class SceneManager {
  private _app: PIXI.Application;
  private _world: PIXI.Container;
  private _eventBus: PIXI.EventEmitter;
  private _currentScene!: GameScene;
  private _nextScene!: GameScene;
  private _scenes: GameScene[];
  private _overlay!: PIXI.Graphics;
  private readonly _ticker!: (ticker: PIXI.Ticker) => void;
  private _persistentScenes: GameScene[];
  readonly _sceneContainer: PIXI.Container;
  readonly _persistentContainer: PIXI.Container;

  constructor(gameServices: GameServices) {
    this._app = gameServices.app;
    this._world = gameServices.world;
    this._eventBus = gameServices.eventBus;
    this._scenes = [];
    this._persistentScenes = [];

    this._sceneContainer = new Container();
    this._world.addChild(this._sceneContainer);

    this._createOverlay();
    this._createTransition();

    this._persistentContainer = new Container();
    this._persistentContainer.layout = {
      width: '100%',
      height: '100%',
    };
    this._world.addChild(this._persistentContainer);

    this._ticker = (ticker) => {
      this._update(ticker.deltaMS / 1000);
    };

    this._app.ticker.add(this._ticker);

    this._subscribe();
  }

  private _createOverlay(): void {
    this._overlay = new Graphics().rect(-960, -960, 1920, 1920).fill({ color: 0x000000, alpha: 1 });
    this._overlay.alpha = 0;

    this._world.addChild(this._overlay);
  }

  private _createTransition(): void {
    transitions.register('fade', async (from, to, container, duration, overlay) => {
      if (overlay) {
        await gsap.to(overlay, {
          alpha: 1,
          duration: duration * 0.5,
        });
      }

      container.removeChild(from);
      container.addChild(to);

      if (overlay) {
        await gsap.to(overlay, {
          alpha: 0,
          duration: duration * 0.5,
        });
      }
    });
  }

  private _onResizeEvent = (isPortrait: boolean) => {
    const { baseWidth, baseHeight } = gameConfig;
    this._sceneContainer.position.set(baseWidth * 0.5, baseHeight * 0.5);

    this._overlay.position.set(baseWidth * 0.5, baseHeight * 0.5);

    this._scenes.forEach((scene) => {
      scene.onResize(isPortrait);
    });

    this._persistentScenes.forEach((scene) => {
      scene.onResize(isPortrait);
    });
  };

  private _subscribe(): void {
    this._eventBus.on(CONSTANTS.EVENTS.RESIZE, this._onResizeEvent);
  }

  unsubscribe(): void {
    this._eventBus.off(CONSTANTS.EVENTS.RESIZE, this._onResizeEvent);
  }

  addScene(scene: GameScene): void {
    this._scenes.push(scene);

    if (!this._currentScene) {
      this._currentScene = scene;
      this._sceneContainer.addChild(scene);
      this._currentScene.onEnter();
    }
  }

  addPersistentScene(scene: GameScene): void {
    this._persistentScenes.push(scene);

    this._persistentContainer.addChild(scene);
  }

  public async switchSceneTo(sceneToId: string): Promise<void> {
    const sceneTo = this._scenes.find((scene) => scene.label === sceneToId);

    if (sceneTo && sceneTo !== this._currentScene) {
      this._nextScene = sceneTo;

      await transitions.switchSceneTo(
        this._currentScene,
        this._nextScene,
        this._sceneContainer,
        'fade',
        1,
        this._overlay
      );
      this._currentScene.onExit();
      this._currentScene = sceneTo;
      this._currentScene.onEnter();
    }
  }

  private _update(dt: number): void {
    if (this._currentScene) {
      this._currentScene.update(dt);
    }
  }
}
