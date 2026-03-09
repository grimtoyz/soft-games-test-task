import * as PIXI from 'pixi.js';
import { FancyButton } from '@pixi/ui';
import { Application, EventEmitter, Container, Sprite } from "pixi.js";
import '@pixi/layout';
import {GameScene} from "../scenes/GameScene";
import {FPSCounter} from "../components/FPSCounter";
import gameConfig from "../../config/gameConfig.json"
import uiConfig from "../../config/uiConfig.json"
import fpsCounterConfig from "../../config/fpsCounterConfig.json"


export class PersistentUI extends GameScene{
	private _uiContainer: Container;
	private _buttonContainer: Container;
	private _fpsCounter: FPSCounter;
	private _buttonsBg: PIXI.Sprite;
	readonly _sceneTitles: string[];
	readonly _app: Application;
	readonly _world: Container;
	readonly _eventBus: EventEmitter;
	readonly _onInteractCb: Function;

	constructor(
		app: Application,
		eventBus: PIXI.EventEmitter,
		world: PIXI.Container,
		sceneTitles: string[],
		onInteractCb: Function = () =>{}
	) {
		super();

		this._app = app;
		this._world = world;
		this.label = 'PersistentUI';
		this._onInteractCb = onInteractCb;

		this._sceneTitles = [...sceneTitles];

		this._eventBus = eventBus;
		this._createButtons();
		this._createFPSCounter();
	}

	private _createButtons(): void {
		this._uiContainer = new Container();
		this.addChild(this._uiContainer);

		this._buttonsBg = Sprite.from('buttons_bg.png');
		this._buttonsBg.anchor.set(0.5, 1);
		this._buttonsBg.alpha = 0.75;
		this._uiContainer.addChild(this._buttonsBg);

		this._buttonContainer = new PIXI.Container({
			layout: {
				gap: '60',
				width: '100%',
				flexDirection: 'row',
				flexWrap: 'nowrap',
				justifyContent: 'center',
				alignContent: 'center',
			}
		});
		this._uiContainer.addChild(this._buttonContainer);

		for (let i = 0; i < this._sceneTitles.length; i++) {
			const button = new FancyButton({
				text: this._sceneTitles[i],
				defaultView: PIXI.Sprite.from('button_normal.png'),
				hoverView: PIXI.Sprite.from('button_hover.png'),
				pressedView: PIXI.Sprite.from('button_pressed.png'),
				disabledView: PIXI.Sprite.from('button_normal.png'),
			});
			button.eventMode = 'dynamic';
			button.enabled = true;

			button.textView.style = new PIXI.TextStyle({
				fontFamily: 'DIN Condensed',
				fontSize: 40,
				fill: 0x302222,
			});

			button.layout = {
				width: 242,
				height: 110,
				objectFit: 'cover',
			};

			button.onPress.connect(() => {
				if (this._onInteractCb) {
					this._onInteractCb(i);
				}
			});

			this._buttonContainer.addChild(button);
		}
	}

	private _createFPSCounter(): void {
		this._fpsCounter = new FPSCounter(this._app);
		this.addChild(this._fpsCounter);
	}

	public onResize(isPortrait: boolean) {
		const { baseWidth, baseHeight } = gameConfig;
		this.position.set(baseWidth * 0.5, baseHeight * 0.5);

		const leftBorderX = -this._app.screen.width * 0.5 / this._world.scale.x;
		const topBorderY = -this._app.screen.height * 0.5 / this._world.scale.y;

		const buttonContainerX = -this._buttonContainer.width * 0.5;
		const buttonContainerY = -this._buttonContainer.height * 0.5 - this._buttonsBg.height * 0.5;
		this._buttonContainer.position.set(buttonContainerX, buttonContainerY);

		const {uiScale} = uiConfig;
		const scale = isPortrait ? uiScale.port : uiScale.land;
		this._uiContainer.position.y = this._app.screen.height * 0.5 / this._world.scale.y;
		this._uiContainer.scale.set(scale);

		const {offsetLeft, offsetTop} = fpsCounterConfig;

		const halfWidth = this._fpsCounter.width * 0.5;
		const halfHeight = this._fpsCounter.height * 0.5;
		this._fpsCounter.position.set(leftBorderX + halfWidth + offsetLeft, topBorderY + halfHeight + offsetTop);
	}
}