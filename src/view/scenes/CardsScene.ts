import * as PIXI from 'pixi.js';
import aceOfShadows from "../../config/scenes/aceOfShadowsConfig.json";
import {GameScene} from "./GameScene";
import {Deck} from "../components/cards/Deck";
import {ResizeModel} from "../../models/ResizeModel";
import {CardsController} from "../../controllers/CardsController";

export class CardsScene extends GameScene {
	private _app: PIXI.Application;
	private _cardsController: CardsController;
	readonly _config: ICardsSceneConfig;
	readonly _resizeModel: ResizeModel;
	readonly _decks: Deck[];
	readonly _decksContainer: PIXI.Container;
	readonly _movingCardContainer: PIXI.Container;

	constructor(name: string, app: PIXI.Application, resizeModel: ResizeModel) {
		super(name);

		this._app = app;
		this._config = aceOfShadows;
		this._resizeModel = resizeModel;
		this._decks = [];

		const bg = PIXI.Sprite.from('green_bg');
		bg.anchor.set(0.5);
		this.addChild(bg);

		this._decksContainer = new PIXI.Container();
		this.addChild(this._decksContainer);

		this._movingCardContainer = new PIXI.Container();
		this.addChild(this._movingCardContainer);

		this._createDecks();

		this._cardsController = new CardsController(
			this._app,
			this._decks[0],
			this._decks[1],
			this._decksContainer,
			this._movingCardContainer,
			this._resizeModel,
			this._config.fromAmount
		);
	}

	private _createDecks(): void {
		const { decks } = this._config;

		decks.forEach((deckConfig) => {
			const deck = new Deck();
			deck.label = deckConfig.name;
			this._decks.push(deck);

			this._decksContainer.addChild(deck);
		})

		this.onResize(this._resizeModel.isPortrait);
	}

	public onEnter() {
		this._cardsController.startCardsDealing();
	}

	public onExit() {
		this._cardsController.resetCards();
	}

	public update(delta: number): void {
	}

	public onResize(isPortrait: boolean): void {
		this._decks.forEach(deck => {
			const deckConfig = this._config.decks.find((deckConfig) => deckConfig.name === deck.label);
			const { transforms } = deckConfig;
			deck.scale.set(isPortrait ? transforms.port.scale : transforms.land.scale);

			const deckPosX = isPortrait ? transforms.port.position.x : transforms.land.position.x;
			const deckPosY = isPortrait ? transforms.port.position.y : transforms.land.position.y;
			deck.position.set(deckPosX, deckPosY);
		})
	}
}