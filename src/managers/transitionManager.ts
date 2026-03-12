import * as PIXI from 'pixi.js';
import type { GameScene } from '../view/scenes/GameScene.ts';
import type { Transition } from '../types/types.ts';

export class TransitionManager {
  private transitions: Record<string, Transition> = {};

  register(name: string, transition: Transition) {
    this.transitions[name] = transition;
  }

  public async switchSceneTo(
    from: GameScene,
    next: GameScene,
    container: PIXI.Container,
    type: string = 'fade',
    duration = 0.5,
    overlay?: PIXI.Graphics
  ): Promise<void> {
    const transition = this.transitions[type];

    if (!transition) throw new Error(`Transition ${type} not found`);

    await transition(from, next, container, duration, overlay);
  }
}

export const transitions = new TransitionManager();
