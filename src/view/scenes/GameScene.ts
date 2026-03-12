import * as PIXI from 'pixi.js';

export abstract class GameScene extends PIXI.Container {
  protected constructor(name: string) {
    super();
    this.label = name;
  }

  public onEnter() {}

  public onExit() {}

  public update(_dt: number): void {}

  onResize(_isPortrait: boolean) {}
}
