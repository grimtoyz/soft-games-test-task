import {
	Container,
	Sprite,
	Texture,
} from 'pixi.js';
import {Utils} from "../../../utils/Utils";

type FireParticle = {
	sprite: Sprite;
	active: boolean;
	age: number;
	life: number;

	startX: number;
	startY: number;

	rise: number;
	drift: number;

	wobbleAmp: number;
	wobbleSpeed: number;
	phase: number;

	flipX: -1 | 1;
	startScale: number;
	endScale: number;

	baseAlpha: number;
};

type FireEmitterOptions = {
	texture: Texture;
	maxParticles?: number;
	emitEvery?: number;
};

export class FireEmitter extends Container {
	private readonly flameRoot: Container;
	private readonly particlesLayer: Container;
	private readonly particles: FireParticle[] = [];

	private elapsed = 0;
	private emitTimer = 0;

	private readonly maxParticles: number;
	private readonly emitEvery: number;

	// глобальні параметри
	public baseWind = 0;
	public windGustAmp = 10;
	public windFreq = 1.7;

	public swayAmp = 3;
	public swaySpeed = 2.4;

	public skewAmp = 0.06;
	public skewSpeed = 2.0;

	constructor(options: FireEmitterOptions) {
		super();

		this.maxParticles = options.maxParticles ?? 10;
		this.emitEvery = options.emitEvery ?? 0.08;

		this.flameRoot = new Container();
		this.particlesLayer = new Container();

		this.flameRoot.addChild(this.particlesLayer);
		this.addChild(this.flameRoot);

		for (let i = 0; i < this.maxParticles; i++) {
			const sprite = new Sprite(options.texture);

			sprite.anchor.set(0.5, 1);
			sprite.visible = false;
			sprite.blendMode = 'add';

			this.particlesLayer.addChild(sprite);

			this.particles.push({
				sprite,
				active: false,
				age: 0,
				life: 0.8,

				startX: 0,
				startY: 0,

				rise: 40,
				drift: 0,

				wobbleAmp: 0,
				wobbleSpeed: 0,
				phase: 0,

				startScale: 0.008,
				endScale: 0.002,

				baseAlpha: 0.9,
			});
		}
	}

	public update(dtSeconds: number): void {
		this.elapsed += dtSeconds;
		this.emitTimer += dtSeconds;

		this.flameRoot.x = Math.sin(this.elapsed * this.swaySpeed) * this.swayAmp;
		this.flameRoot.skew.x =
			Math.sin(this.elapsed * this.skewSpeed + 0.7) * this.skewAmp;

		while (this.emitTimer >= this.emitEvery) {
			this.emitTimer -= this.emitEvery;
			this.spawnParticle();
		}

		const windNow =
			this.baseWind + Math.sin(this.elapsed * this.windFreq) * this.windGustAmp;

		for (const p of this.particles) {
			if (!p.active) continue;

			p.age += dtSeconds;

			if (p.age >= p.life) {
				p.active = false;
				p.sprite.visible = false;
				continue;
			}

			const t = p.age / p.life; // 0..1

			const x =
				p.startX +
				windNow * t +
				p.drift * t +
				Math.sin(this.elapsed * p.wobbleSpeed + p.phase) *
				p.wobbleAmp *
				(1 - t);

			const y = p.startY - p.rise * t;

			p.sprite.x = x;
			p.sprite.y = y;

			p.sprite.alpha = Math.sin(t * Math.PI) * p.baseAlpha;

			const scale = Utils.lerp(p.startScale, p.endScale, t);
			p.sprite.scale.set(scale * p.flipX, scale);

			p.sprite.rotation =
				0.15 * Math.sin(this.elapsed * (p.wobbleSpeed * 0.8) + p.phase);
		}
	}

	private spawnParticle(): void {
		const p = this.particles.find((it) => !it.active);
		if (!p) return;

		p.active = true;
		p.age = 0;

		p.life = Utils.rand(0.55, 0.95);

		p.startX = Utils.rand(-4, 4);
		p.startY = Utils.rand(0, 2);

		p.rise = Utils.rand(28, 56);
		p.drift = Utils.rand(-6, 6);

		p.wobbleAmp = Utils.rand(2, 8);
		p.wobbleSpeed = Utils.rand(4, 8);
		p.phase = Utils.rand(0, Math.PI * 2);

		p.flipX = Math.random() < 0.5 ? -1 : 1;
		p.startScale = Utils.rand(0.12, 0.22);
		p.endScale = Utils.rand(0.45, 0.95);

		p.baseAlpha = Utils.rand(0.65, 0.95);

		p.sprite.visible = true;
		p.sprite.x = p.startX;
		p.sprite.y = p.startY;
		p.sprite.alpha = 0;
		p.sprite.scale.set(p.startScale * p.flipX, p.startScale);
	}
}

