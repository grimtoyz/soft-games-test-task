import * as PIXI from 'pixi.js';
import {Deck} from "../view/components/cards/Deck";
import gsap from "gsap";
import {Card} from "../view/components/cards/Card";
import {ResizeModel} from "../models/ResizeModel";
import aceOfShadows from "../config/scenes/aceOfShadowsConfig.json";

type CardFlight = {
	card: Card
	fromCard: Card
	toCard: Card
	state: { progress: number }
	timeline: GSAPTimeline
}

export class CardsController {
	private _app: PIXI.Application;
	private _deckFrom: Deck;
	private _deckTo: Deck;
	private _dealTimer: gsap.timeline;
	private _decksContainer: PIXI.Container;
	private _movingCardContainer: PIXI.Container;
	private _cardPool: Card[];
	private _resizeModel: ResizeModel;
	private _activeFlights: CardFlight[];
	readonly _fromAmount: number;

	constructor(
		app: PIXI.Application,
		deckFrom: Deck,
		deckTo: Deck,
		decksContainer,
		movingCardContainer,
		resizeModel,
		fromAmount: number
	) {
		this._app = app;
		this._cardPool = [];
		this._activeFlights = [];
		this._deckFrom = deckFrom;
		this._deckTo = deckTo;
		this._decksContainer = decksContainer;
		this._movingCardContainer = movingCardContainer;
		this._resizeModel = resizeModel;
		this._fromAmount = fromAmount;

		this._createCards();
	}

	private _createCards(): void {
		this._deckFrom.createCards(this._fromAmount);
	}

	public resetCards(): void {
		this._dealTimer.kill();
		this._activeFlights.forEach((flight) => {
			flight.timeline.kill();
			if (flight.card.parent !== this._deckFrom) {
				this._deckFrom.reparentChild(flight.card);
			}
			this._deckFrom.addCard(flight.card);
		});
		this._activeFlights = [];
		while(this._deckTo.children.length) {
			this._deckFrom.reparentChild(this._deckTo.getTopCard(), 0);
		}
		this._deckTo.reset();
		this._deckFrom.rearrange();
	}

	public startCardsDealing(): void {
		this._dealTimer = gsap.timeline({
			repeat: -1,
			onRepeat: () => {
				if (this._deckFrom.children.length === 0) {
					this._dealTimer.kill();
				} else {
					this._playDealAnimation();
				}
			},
		});

		this._dealTimer.to({}, { duration: 1 });
	}

	private async _playDealAnimation(): Promise<void> {
		const movingCard = this._deckFrom.getTopCard();

		const localX = movingCard.position.x;
		const localY = movingCard.position.y;
		const worldXPort = aceOfShadows.decks[0].transforms.port.position.x + localX * aceOfShadows.decks[0].transforms.port.scale;
		const worldYPort = aceOfShadows.decks[0].transforms.port.position.y + localY * aceOfShadows.decks[0].transforms.port.scale;
		const worldXLand = aceOfShadows.decks[0].transforms.land.position.x + localX * aceOfShadows.decks[0].transforms.land.scale;
		const worldYLand = aceOfShadows.decks[0].transforms.land.position.y + localY * aceOfShadows.decks[0].transforms.land.scale;

		movingCard.setOriginalTransforms(
			new PIXI.Point(worldXPort, worldYPort),
			new PIXI.Point(worldXLand, worldYLand),
			aceOfShadows.decks[0].transforms.port.scale,
			aceOfShadows.decks[0].transforms.land.scale,
		)
		this._movingCardContainer.reparentChild(movingCard);

		const nextToLocalPosition: PIXI.Point = this._deckTo.getNextPosition();
		const targetLocalX = nextToLocalPosition.x;
		const targetLocalY = nextToLocalPosition.y;
		const targetWorldXPort = aceOfShadows.decks[1].transforms.port.position.x + targetLocalX * aceOfShadows.decks[1].transforms.port.scale;
		const targetWorldYPort = aceOfShadows.decks[1].transforms.port.position.y + targetLocalY * aceOfShadows.decks[1].transforms.port.scale;
		const targetWorldXLand = aceOfShadows.decks[1].transforms.land.position.x + targetLocalX * aceOfShadows.decks[1].transforms.land.scale;
		const targetWorldYLand = aceOfShadows.decks[1].transforms.land.position.y + targetLocalY * aceOfShadows.decks[1].transforms.land.scale;

		movingCard.setTargetTransforms(
			new PIXI.Point(targetWorldXPort, targetWorldYPort),
			new PIXI.Point(targetWorldXLand, targetWorldYLand),
			aceOfShadows.decks[1].transforms.port.scale,
			aceOfShadows.decks[1].transforms.land.scale,
		)

		await this._moveCard(movingCard);
	}

	private _moveCard(card: Card): void {
		const state = { progress: 0 };

		const flight: CardFlight = {
			card,
			state,
			timeline: null as any
		};

		flight.timeline = gsap.timeline({
			onUpdate: () => this._updateFlight(flight)
		});

		flight.timeline.to(state, {
			progress: 1,
			duration: 2,
			ease: "power2.inOut",
			onComplete: async () => {
				await new Promise(r => this._app.ticker.addOnce(r));
				// this._deckTo.reparentChild(card);
				this._deckTo.addCard(card);
			}
		});

		this._activeFlights.push(flight);
	}

	private _updateFlight(flight: CardFlight): void {
		const { card, state } = flight;
		const isPort = this._resizeModel.isPortrait;

		const originalPosition = isPort ? card.getOriginalPositionPort() : card.getOriginalPositionLand();
		const targetPosition = isPort ? card.getTargetPositionPort() : card.getTargetPositionLand();

		const originalScale = isPort ? card.getOriginalScalePort() : card.getOriginalScaleLand();
		const targetScale = isPort ? card.getTargetScalePort() : card.getTargetScaleLand();

		card.position.x = gsap.utils.interpolate(originalPosition.x, targetPosition.x, state.progress);
		const posY = gsap.utils.interpolate(originalPosition.y, targetPosition.y, state.progress);
		const arc = Math.sin(state.progress * Math.PI) * 80;
		card.position.y = posY - arc;

		card.scale.x = gsap.utils.interpolate(originalScale, targetScale, state.progress);
		card.scale.y = gsap.utils.interpolate(originalScale, targetScale, state.progress);
	}
}