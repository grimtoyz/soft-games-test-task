import * as PIXI from 'pixi.js';
import gsap from "gsap";
import {FireEmitter} from "./FireEmitter";
import {Sprite} from "pixi.js";
import fireSceneConfig from "../../../config/scenes/phoenixFlameConfig.json";
import {Utils} from "../../../utils/Utils";

export class Fire extends PIXI.Container {
	private _app: PIXI.Application;
	private _glow: PIXI.Sprite;
	private _fireBackGlow: PIXI.Sprite;
	private _fire: PIXI.Sprite;
	private _glowTime: number;
	private _glowPhase: number;
	private _glowAmp: number;
	private _glowBaseAlpha: number;
	private _glowPauseTimer: number;
	private _glowTargetAmp: number;

	constructor(app: PIXI.Application) {
		super();

		this._app = app;

		this._createGlow();
		this._createFireplace();
		this._createEmitter();
	}

	private _createGlow(): void {
		this._fireBackGlow = Sprite.from('glow_circle.png');
		this._fireBackGlow.blendMode = 'add';
		this._fireBackGlow.anchor.set(0.5);
		this._fireBackGlow.position.y = -400;
		this._fireBackGlow.scale.set(2);
		this.addChild(this._fireBackGlow);

		this._glow = Sprite.from('glow.png');
		this._glow.blendMode = 'add';
		this._glow.anchor.set(0.5, 0.4);

		this._glowTime = 0;
		this._glowPhase = Math.random() * Math.PI * 2;
		this._glowBaseAlpha = 1;
		this._glowPauseTimer = Utils.rand(0.08, 0.28);
		this._glowAmp = Utils.rand(0.03, 0.12);
		this._glowTargetAmp = Utils.rand(0.03, 0.12);

		this.addChild(this._glow);
	}

	private _createFireplace(): void {
		this._fire = Sprite.from('fireplace.png')
		this._fire.anchor.set(0.5, 0.8);

		this.addChild(this._fire);
	}

	private _createEmitter(): void {
		const flameTextures = [
			PIXI.Assets.get('fire_particle_type_b.png'),
			PIXI.Assets.get('fire_particle_type_c.png'),
		];
		const emitter = new FireEmitter({
			flameTextures,
			smokeTextures: PIXI.Assets.get('smoke_type_a.png'),

			maxParticles: fireSceneConfig.emitter.maxParticles,
			emitEvery: 0.02,
			smokeChance: 0.1,

			baseWind: 2,
			windGustAmp: 8,
			windFreq: 1.4,

			swayAmp: 2.5,
			swaySpeed: 2.1,

			skewAmp: 0.04,
			skewSpeed: 1.8,
		});

		emitter.scale.set(2.4);
		emitter.position.y = -170;

		this.addChild(emitter);

		this._app.ticker.add((ticker) => {
			emitter.update(ticker.deltaMS / 1000);
		});
	}

	private _updateGlow(dt: number): void {
		this._glowTime += dt;
		this._glowPauseTimer -= dt;

		if (this._glowPauseTimer <= 0) {
			this._glowPauseTimer = Utils.rand(0.08, 0.28);

			this._glowTargetAmp = Math.random() < 0.25
				? Utils.rand(0.0, 0.02)
				: Utils.rand(0.03, 0.12);
		}

		this._glowAmp = Utils.lerp(this._glowAmp, this._glowTargetAmp, 0.08);

		const wave1 = Math.sin(this._glowTime * 8.5 + this._glowPhase);
		const wave2 = Math.sin(this._glowTime * 4.2 + this._glowPhase * 1.7);
		const wave = wave1 * 0.75 + wave2 * 0.25;

		this._glow.alpha = gsap.utils.clamp(
			0.01,
			0.3,
			this._glowBaseAlpha + wave * this._glowAmp,
		);
		this._fireBackGlow.alpha = this._glow.alpha;

		const s = Utils.lerp(0.98, 1.04, (wave1 + 1) * 0.5);
		this._glow.scale.set(1.2 * s, s);
	}

	public update(dt: number): void {
		this._updateGlow(dt);
	}
}