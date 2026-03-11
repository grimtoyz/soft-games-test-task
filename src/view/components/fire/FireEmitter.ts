import {
	Container,
	Sprite,
	Texture,
} from 'pixi.js';
import {Utils} from "../../../utils/Utils";

type ParticleKind = 'flame' | 'smoke';

type TextureInput = Texture | Texture[];

type FireEmitterOptions = {
	flameTextures: TextureInput;
	smokeTextures: TextureInput;

	maxParticles?: number;
	emitEvery?: number;

	smokeChance?: number;

	baseWind?: number;
	windGustAmp?: number;
	windFreq?: number;

	swayAmp?: number;
	swaySpeed?: number;

	skewAmp?: number;
	skewSpeed?: number;

	flameTintFrom?: number;
	flameTintTo?: number;

	smokeTintFrom?: number;
	smokeTintTo?: number;
};

type FireParticle = {
	sprite: Sprite;
	active: boolean;
	kind: ParticleKind;

	age: number;
	life: number;

	startX: number;
	startY: number;

	rise: number;
	drift: number;

	wobbleAmp: number;
	wobbleSpeed: number;
	phaseOffset: number;

	startScale: number;
	endScale: number;
	flipX: -1 | 1;

	baseAlpha: number;
};

export class FireEmitter extends Container {
	private readonly _flameRoot: Container;
	// private readonly _particlesLayer: Container;
	private readonly _smokeLayer: Container;
	private readonly _flamesLayer: Container;
	private readonly _particles: FireParticle[] = [];

	private readonly _flameTextures: Texture[];
	private readonly _smokeTextures: Texture[];

	private _elapsed = 0;
	private _emitTimer = 0;

	private readonly _maxParticles: number;
	private readonly _emitEvery: number;
	private readonly _smokeChance: number;

	public baseWind: number;
	public windGustAmp: number;
	public windFreq: number;

	public swayAmp: number;
	public swaySpeed: number;

	public skewAmp: number;
	public skewSpeed: number;

	public flameTintFrom: number;
	public flameTintTo: number;

	public smokeTintFrom: number;
	public smokeTintTo: number;

	constructor(options: FireEmitterOptions) {
		super();

		this._flameTextures = normalizeTextures(options.flameTextures);
		this._smokeTextures = normalizeTextures(options.smokeTextures);

		if (this._flameTextures.length === 0) {
			throw new Error('FireEmitter: flameTextures is empty');
		}

		if (this._smokeTextures.length === 0) {
			throw new Error('FireEmitter: smokeTextures is empty');
		}

		this._maxParticles = options.maxParticles ?? 10;
		this._emitEvery = options.emitEvery ?? 0.08;
		this._smokeChance = options.smokeChance ?? 0.28;

		this.baseWind = options.baseWind ?? 0;
		this.windGustAmp = options.windGustAmp ?? 10;
		this.windFreq = options.windFreq ?? 1.7;

		this.swayAmp = options.swayAmp ?? 3;
		this.swaySpeed = options.swaySpeed ?? 2.4;

		this.skewAmp = options.skewAmp ?? 0.06;
		this.skewSpeed = options.skewSpeed ?? 2.0;

		this.flameTintFrom = options.flameTintFrom ?? 0xffee88;
		this.flameTintTo = options.flameTintTo ?? 0xff6633;

		this.smokeTintFrom = options.smokeTintFrom ?? 0x888888;
		this.smokeTintTo = options.smokeTintTo ?? 0x3d3d3d;

		this._flameRoot = new Container();
		this._smokeLayer = new Container();
		this._flamesLayer = new Container();

		this._flameRoot.addChild(this._smokeLayer);
		this._flameRoot.addChild(this._flamesLayer);

		this._flameRoot.addChild(this._smokeLayer);
		this._flameRoot.addChild(this._flamesLayer);
		this.addChild(this._flameRoot);

		for (let i = 0; i < this._maxParticles; i++) {
			const sprite = new Sprite(this._flameTextures[0]);

			sprite.anchor.set(0.5, 1);
			sprite.visible = false;
			sprite.alpha = 0;
			sprite.blendMode = 'add';

			this._flamesLayer.addChild(sprite);

			this._particles.push({
				sprite,
				active: false,
				kind: 'flame',

				age: 0,
				life: 0.8,

				startX: 0,
				startY: 0,

				rise: 40,
				drift: 0,

				wobbleAmp: 0,
				wobbleSpeed: 0,
				phaseOffset: 0,

				startScale: 0.8,
				endScale: 0.2,
				flipX: 1,

				baseAlpha: 0.9,
			});
		}
	}

	public update(dtSeconds: number): void {
		this._elapsed += dtSeconds;
		this._emitTimer += dtSeconds;

		this._flameRoot.x =
			Math.sin(this._elapsed * this.swaySpeed) * this.swayAmp;

		this._flameRoot.skew.x =
			Math.sin(this._elapsed * this.skewSpeed + 0.7) * this.skewAmp;

		while (this._emitTimer >= this._emitEvery) {
			this._emitTimer -= this._emitEvery;
			this._spawnParticle();
		}

		const windNow =
			this.baseWind +
			Math.sin(this._elapsed * this.windFreq) * this.windGustAmp;

		for (const p of this._particles) {
			if (!p.active) continue;

			p.age += dtSeconds;

			if (p.age >= p.life) {
				p.active = false;
				p.sprite.visible = false;
				continue;
			}

			const t = p.age / p.life;

			const x =
				p.startX +
				windNow * t +
				p.drift * t +
				Math.sin(this._elapsed * p.wobbleSpeed + p.phaseOffset) *
				p.wobbleAmp *
				(1 - t);

			const y = p.startY - p.rise * t;

			p.sprite.x = x;
			p.sprite.y = y;

			if (p.kind === 'flame') {
				this._updateFlameParticle(p, t);
				this._flamesLayer.addChild(p.sprite);
			} else {
				this._updateSmokeParticle(p, t);
				this._smokeLayer.addChild(p.sprite);
			}

			p.sprite.rotation =
				0.12 *
				Math.sin(this._elapsed * (p.wobbleSpeed * 0.75) + p.phaseOffset);
		}
	}

	public burst(count: number): void {
		for (let i = 0; i < count; i++) {
			this._spawnParticle();
		}
	}

	private _spawnParticle(): void {
		const p = this._particles.find((it) => !it.active);
		if (!p) return;

		p.active = true;
		p.age = 0;
		p.flipX = Math.random() < 0.5 ? -1 : 1;

		const isSmoke = Math.random() < this._smokeChance;
		p.kind = isSmoke ? 'smoke' : 'flame';

		p.startX = Utils.rand(-4, 4);
		p.startY = Utils.rand(0, 2);

		p.phaseOffset = Utils.rand(0, Math.PI * 2);

		if (p.kind === 'flame') {
			p.life = Utils.rand(0.55, 0.95);
			p.rise = Utils.rand(36, 62);
			p.drift = Utils.rand(-4, 4);

			p.wobbleAmp = Utils.rand(2, 7);
			p.wobbleSpeed = Utils.rand(4, 8);

			p.startScale = Utils.rand(0.12, 0.22);
			p.endScale = Utils.rand(0.45, 0.95);

			p.baseAlpha = Utils.rand(0.65, 0.95);

			p.sprite.texture = Utils.randomFrom(this._flameTextures);
			p.sprite.blendMode = 'add';
			p.sprite.tint = this.flameTintFrom;
		} else {
			p.life = Utils.rand(0.9, 1.7);
			p.rise = Utils.rand(24, 44);
			p.drift = Utils.rand(-10, 10);

			p.wobbleAmp = Utils.rand(4, 10);
			p.wobbleSpeed = Utils.rand(2, 5);

			p.startScale = Utils.rand(0.10, 0.18);
			p.endScale = Utils.rand(2.55, 5.05);

			p.baseAlpha = Utils.rand(0.18, 0.42);

			p.sprite.texture = Utils.randomFrom(this._smokeTextures);
			p.sprite.blendMode = 'normal';
			p.sprite.tint = this.smokeTintFrom;
		}

		p.sprite.visible = true;
		p.sprite.x = p.startX;
		p.sprite.y = p.startY;
		p.sprite.alpha = 0;

		p.sprite.scale.set(p.startScale * p.flipX, p.startScale);
	}

	private _updateFlameParticle(p: FireParticle, t: number): void {
		p.sprite.alpha = (1 - t) * p.baseAlpha;

		const scale = Utils.lerp(p.startScale, p.endScale, t);
		p.sprite.scale.set(scale * p.flipX, scale);

		p.sprite.tint = Utils.lerpColor(this.flameTintFrom, this.flameTintTo, t);
	}

	private _updateSmokeParticle(p: FireParticle, t: number): void {
		p.sprite.alpha = Math.sin(t * Math.PI) * p.baseAlpha;

		const scale = Utils.lerp(p.startScale, p.endScale, t);
		p.sprite.scale.set(scale * p.flipX, scale);

		p.sprite.tint = Utils.lerpColor(this.smokeTintFrom, this.smokeTintTo, t);
	}
}

function normalizeTextures(input: TextureInput): Texture[] {
	return Array.isArray(input) ? input : [input];
}



