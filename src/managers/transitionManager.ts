import gsap from "gsap";

export class TransitionManager {
	private root!: PIXI.Container;
	private current: PIXI.Container | null = null;

	private transitions: Record<string, Transition> = {};

	init(root: PIXI.Container) {
		this.root = root;
	}

	register(name: string, transition: Transition) {
		this.transitions[name] = transition;
	}

	async switchScenesFromTo(
		from: PIXI.Container,
		next: PIXI.Container,
		type = "fade",
		duration = 0.5
	) {
		const transition = this.transitions[type];

		if (!transition) throw new Error(`Transition ${type} not found`);

		this.root.addChild(next);

		await transition(this.current, next, duration);

		if (this.current) {
			this.root.removeChild(this.current);
			this.current.destroy({ children: true });
		}

		this.current = next;
	}
}

export const transitions = new TransitionManager();